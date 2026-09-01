'use server';

import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/features/audit/service';
import { requireOrganizationManage } from '@/features/auth/guards';
import { ConflictError, isExpectedError, isTransientDatabaseError, NotFoundError } from '@/lib/errors';
import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validation/field-errors';
import { actionErrors } from '@/lib/i18n/errors';
import { actionError, actionOk, type ActionResult } from '@/types/domain';

import {
  addQuestionSchema,
  assignVersionSchema,
  createQuestionnaireSchema,
  needsOptions,
  newDraftSchema,
  parseOptions,
  publishVersionSchema,
  removeQuestionSchema,
} from './schemas';

/** Only asked below five stars — the branching §11 of the specification calls for. */
const BELOW_FIVE = { all: [{ field: 'overall_score', operator: 'lt', value: 5 }] };

/**
 * Creates a questionnaire and its first draft version.
 *
 * Authoring is an organization-administrator power, checked by
 * `requireOrganizationManage`; the RLS policies apply `can_author_questionnaire`
 * underneath.
 */
export async function createQuestionnaireAction(
  _previous: ActionResult<{ versionId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ versionId: string }>> {
  const parsed = createQuestionnaireSchema.safeParse({
    organizationId: formData.get('organizationId'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });

  if (!parsed.success) {
    return actionError((await actionErrors()).checkForm, toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    await requireOrganizationManage(input.organizationId);
    const supabase = await createSupabaseServerClient();

    const { data: template, error: templateError } = await supabase
      .from('questionnaire_templates')
      .insert({
        organization_id: input.organizationId,
        name: input.name,
        description: input.description || null,
      })
      .select('id')
      .single();

    if (templateError) throw templateError;

    const { data: version, error: versionError } = await supabase
      .from('questionnaire_versions')
      .insert({
        questionnaire_template_id: template.id,
        organization_id: input.organizationId,
        version_number: 1,
        status: 'draft',
      })
      .select('id')
      .single();

    if (versionError) throw versionError;

    await writeAuditLog({
      action: 'questionnaire.created',
      entityType: 'questionnaire_template',
      entityId: template.id,
      organizationId: input.organizationId,
      after: { name: input.name },
    });

    revalidatePath('/app/questionnaires');
    return actionOk({ versionId: version.id });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('questionnaire creation failed', {
      organization_id: input.organizationId,
      ...describeError(error),
    });
    return actionError((await actionErrors()).questionnaireCreate);
  }
}

/**
 * Adds a question to a draft.
 *
 * The immutability trigger refuses this on a published version, so the guard here
 * exists to produce a sentence a person can act on rather than a constraint
 * violation.
 */
export async function addQuestionAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = addQuestionSchema.safeParse({
    versionId: formData.get('versionId'),
    questionKey: formData.get('questionKey'),
    label: formData.get('label'),
    helpText: formData.get('helpText') || undefined,
    category: formData.get('category') || undefined,
    questionType: formData.get('questionType'),
    required: formData.get('required') === 'on',
    onlyBelowFive: formData.get('onlyBelowFive') === 'on',
    options: formData.get('options') || undefined,
  });

  if (!parsed.success) {
    return actionError((await actionErrors()).checkForm, toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    const supabase = await createSupabaseServerClient();

    const { data: version, error: versionError } = await supabase
      .from('questionnaire_versions')
      .select('id, organization_id, status')
      .eq('id', input.versionId)
      .maybeSingle();

    if (versionError) throw versionError;
    if (!version) throw new NotFoundError('Questionnaire version not found');
    if (!version.organization_id) {
      throw new ConflictError('Platform templates are managed by the platform team');
    }
    if (version.status !== 'draft') {
      throw new ConflictError('This version is published. Create a new draft to change questions.');
    }

    await requireOrganizationManage(version.organization_id);

    const options = parseOptions(input.options);
    if (needsOptions(input.questionType) && options.length === 0) {
      return actionError('Add at least one answer option', {
        options: ['A choice question needs options'],
      });
    }

    // Appended at the end, in steps of ten, so a question can be slotted between
    // two others later without renumbering everything.
    const { data: last } = await supabase
      .from('questions')
      .select('display_order')
      .eq('questionnaire_version_id', input.versionId)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        questionnaire_version_id: input.versionId,
        organization_id: version.organization_id,
        question_key: input.questionKey,
        label: input.label,
        help_text: input.helpText || null,
        category: input.category || null,
        question_type: input.questionType,
        required: input.required ?? false,
        display_order: (last?.display_order ?? 0) + 10,
        condition_json: input.onlyBelowFive ? BELOW_FIVE : null,
      })
      .select('id')
      .single();

    if (questionError) {
      if (questionError.code === '23505') {
        return actionError('That question key is already used in this version', {
          questionKey: ['Already used'],
        });
      }
      throw questionError;
    }

    if (options.length > 0) {
      const { error: optionError } = await supabase.from('question_options').insert(
        options.map((option, index) => ({
          question_id: question.id,
          organization_id: version.organization_id,
          option_key: option.optionKey,
          label: option.label,
          display_order: (index + 1) * 10,
        })),
      );
      if (optionError) throw optionError;
    }

    await writeAuditLog({
      action: 'questionnaire.question_added',
      entityType: 'question',
      entityId: question.id,
      organizationId: version.organization_id,
      after: { question_key: input.questionKey, question_type: input.questionType },
    });

    revalidatePath(`/app/questionnaires/${input.versionId}`);
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('add question failed', { ...describeError(error) });
    return actionError((await actionErrors()).questionAdd);
  }
}

export async function removeQuestionAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = removeQuestionSchema.safeParse({
    versionId: formData.get('versionId'),
    questionId: formData.get('questionId'),
  });
  if (!parsed.success) return actionError((await actionErrors()).invalidRequest);

  try {
    const supabase = await createSupabaseServerClient();
    const { data: version } = await supabase
      .from('questionnaire_versions')
      .select('organization_id, status')
      .eq('id', parsed.data.versionId)
      .maybeSingle();

    if (!version?.organization_id) throw new NotFoundError('Questionnaire version not found');
    if (version.status !== 'draft') {
      throw new ConflictError('This version is published and cannot be changed.');
    }

    await requireOrganizationManage(version.organization_id);

    const { error } = await supabase.from('questions').delete().eq('id', parsed.data.questionId);
    if (error) throw error;

    await writeAuditLog({
      action: 'questionnaire.question_removed',
      entityType: 'question',
      entityId: parsed.data.questionId,
      organizationId: version.organization_id,
    });

    revalidatePath(`/app/questionnaires/${parsed.data.versionId}`);
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('remove question failed', { ...describeError(error) });
    return actionError((await actionErrors()).questionRemove);
  }
}

/**
 * Publishes a draft, after which it can never change again.
 *
 * The database refuses an empty version and refuses every later edit; this is the
 * one-way door, so the UI asks for confirmation before calling it.
 */
export async function publishVersionAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = publishVersionSchema.safeParse({ versionId: formData.get('versionId') });
  if (!parsed.success) return actionError((await actionErrors()).invalidRequest);

  try {
    const supabase = await createSupabaseServerClient();
    const { data: version } = await supabase
      .from('questionnaire_versions')
      .select('organization_id, status')
      .eq('id', parsed.data.versionId)
      .maybeSingle();

    if (!version?.organization_id) throw new NotFoundError('Questionnaire version not found');
    await requireOrganizationManage(version.organization_id);

    const { error } = await supabase
      .from('questionnaire_versions')
      .update({ status: 'published' })
      .eq('id', parsed.data.versionId);

    if (error) {
      // Raised by app.guard_version_transition() for an empty version.
      if (error.code === '23514') {
        throw new ConflictError('Add at least one question before publishing.');
      }
      throw error;
    }

    await writeAuditLog({
      action: 'questionnaire.published',
      entityType: 'questionnaire_version',
      entityId: parsed.data.versionId,
      organizationId: version.organization_id,
    });

    revalidatePath('/app/questionnaires');
    revalidatePath(`/app/questionnaires/${parsed.data.versionId}`);
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('publish version failed', { ...describeError(error) });
    return actionError((await actionErrors()).questionnairePublish);
  }
}

/**
 * Copies the newest version into a fresh draft.
 *
 * This is the only way to change a published questionnaire, which is the point:
 * historic answers reference question ids, so editing in place would rewrite what
 * past responses meant.
 */
export async function newDraftFromTemplateAction(
  _previous: ActionResult<{ versionId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ versionId: string }>> {
  const parsed = newDraftSchema.safeParse({
    templateId: formData.get('templateId'),
    organizationId: formData.get('organizationId'),
  });
  if (!parsed.success) return actionError((await actionErrors()).invalidRequest);

  const { templateId, organizationId } = parsed.data;

  try {
    await requireOrganizationManage(organizationId);
    const supabase = await createSupabaseServerClient();

    const { data: versions, error: versionError } = await supabase
      .from('questionnaire_versions')
      .select('id, version_number, status, organization_id')
      .eq('questionnaire_template_id', templateId)
      .order('version_number', { ascending: false });

    if (versionError) throw versionError;
    if (!versions || versions.length === 0) throw new NotFoundError('Questionnaire not found');

    const existingDraft = versions.find((version) => version.status === 'draft');
    if (existingDraft) {
      // One draft at a time: two open drafts of the same questionnaire is a
      // question nobody can answer about which one is next.
      return actionOk({ versionId: existingDraft.id });
    }

    const source = versions[0];
    const { data: draft, error: draftError } = await supabase
      .from('questionnaire_versions')
      .insert({
        questionnaire_template_id: templateId,
        organization_id: organizationId,
        version_number: source.version_number + 1,
        status: 'draft',
      })
      .select('id')
      .single();

    if (draftError) throw draftError;

    // Copy the questions, then the options, keying by the question key so the new
    // ids line up without a second round-trip per question.
    const { data: sourceQuestions, error: sourceError } = await supabase
      .from('questions')
      .select('question_key, label, help_text, category, question_type, required, display_order, condition_json')
      .eq('questionnaire_version_id', source.id)
      .order('display_order');

    if (sourceError) throw sourceError;

    if (sourceQuestions && sourceQuestions.length > 0) {
      const { data: copied, error: copyError } = await supabase
        .from('questions')
        .insert(
          sourceQuestions.map((question) => ({
            ...question,
            questionnaire_version_id: draft.id,
            organization_id: organizationId,
          })),
        )
        .select('id, question_key');

      if (copyError) throw copyError;

      const { data: sourceOptions } = await supabase
        .from('question_options')
        .select('option_key, label, display_order, question_id, questions(question_key)')
        .in(
          'question_id',
          (
            await supabase.from('questions').select('id').eq('questionnaire_version_id', source.id)
          ).data?.map((row) => row.id) ?? [],
        );

      const newIdByKey = new Map((copied ?? []).map((row) => [row.question_key, row.id]));
      const optionRows = (sourceOptions ?? [])
        .map((option) => {
          const key = option.questions?.question_key;
          const questionId = key ? newIdByKey.get(key) : undefined;
          return questionId
            ? {
                question_id: questionId,
                organization_id: organizationId,
                option_key: option.option_key,
                label: option.label,
                display_order: option.display_order,
              }
            : null;
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (optionRows.length > 0) {
        const { error: optionError } = await supabase.from('question_options').insert(optionRows);
        if (optionError) throw optionError;
      }
    }

    await writeAuditLog({
      action: 'questionnaire.draft_created',
      entityType: 'questionnaire_version',
      entityId: draft.id,
      organizationId,
      metadata: { copied_from: source.id },
    });

    revalidatePath('/app/questionnaires');
    return actionOk({ versionId: draft.id });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('new draft failed', { ...describeError(error) });
    return actionError((await actionErrors()).questionnaireDraft);
  }
}

/**
 * Assigns a published version to every location, to a selection, or to none.
 *
 * "All locations" is one row with a null location, not a row per location: a
 * location added next month should inherit the questionnaire rather than silently
 * ask nothing.
 */
export async function assignVersionAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = assignVersionSchema.safeParse({
    versionId: formData.get('versionId'),
    organizationId: formData.get('organizationId'),
    scope: formData.get('scope'),
    locationIds: formData.getAll('locationIds').filter((v): v is string => typeof v === 'string'),
  });

  if (!parsed.success) {
    return actionError((await actionErrors()).checkForm, toFieldErrors(parsed.error));
  }

  const { versionId, organizationId, scope, locationIds } = parsed.data;

  try {
    await requireOrganizationManage(organizationId);
    const supabase = await createSupabaseServerClient();

    const { data: version } = await supabase
      .from('questionnaire_versions')
      .select('status')
      .eq('id', versionId)
      .maybeSingle();

    if (!version) throw new NotFoundError('Questionnaire version not found');
    if (version.status !== 'published') {
      throw new ConflictError('Publish this version before assigning it to locations.');
    }

    if (scope === 'selected' && locationIds.length === 0) {
      return actionError('Choose at least one location');
    }

    /*
     * Clear whatever currently occupies the target scope, whichever version it
     * belongs to.
     *
     * Only deactivating rows for *this* version was a bug: assigning
     * questionnaire B to a location that already had A active hit the partial
     * unique index every time, which is the ordinary case of switching
     * questionnaires. The scope is what is unique, not the version.
     */
    const clearScope = supabase
      .from('location_questionnaire_assignments')
      .update({ status: 'inactive' })
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (scope === 'all') {
      // The organization-wide row, plus any per-location rows it would otherwise
      // silently lose to: most-specific-wins means leaving them would quietly
      // override the new organization-wide choice.
      const { error: clearError } = await clearScope;
      if (clearError) throw clearError;
    } else if (scope === 'selected') {
      const { error: clearError } = await clearScope.or(
        `location_id.is.null,location_id.in.(${locationIds.join(',')})`,
      );
      if (clearError) throw clearError;
    } else {
      const { error: clearError } = await clearScope.eq('questionnaire_version_id', versionId);
      if (clearError) throw clearError;
    }

    if (scope !== 'none') {
      // Typed explicitly so `location_id: null` and a string id share one row
      // type; otherwise the two branches infer as incompatible arrays.
      const rows: Array<{
        organization_id: string;
        location_id: string | null;
        questionnaire_version_id: string;
        status: 'active';
      }> =
        scope === 'all'
          ? [
              {
                organization_id: organizationId,
                location_id: null,
                questionnaire_version_id: versionId,
                status: 'active',
              },
            ]
          : locationIds.map((locationId) => ({
              organization_id: organizationId,
              location_id: locationId,
              questionnaire_version_id: versionId,
              status: 'active',
            }));

      const { error } = await supabase.from('location_questionnaire_assignments').insert(rows);

      if (error) {
        if (error.code === '23505') {
          throw new ConflictError(
            'Another questionnaire is already active for that scope. Set it to none first.',
          );
        }
        throw error;
      }
    }

    await writeAuditLog({
      action: 'questionnaire.assigned',
      entityType: 'questionnaire_version',
      entityId: versionId,
      organizationId,
      after: { scope, location_count: scope === 'selected' ? locationIds.length : null },
    });

    revalidatePath('/app/questionnaires');
    revalidatePath(`/app/questionnaires/${versionId}`);
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('assign version failed', { ...describeError(error) });
    return actionError((await actionErrors()).questionnaireAssign);
  }
}
