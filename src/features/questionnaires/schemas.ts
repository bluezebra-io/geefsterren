import { z } from 'zod';

export const QUESTION_TYPES = [
  'rating',
  'single_choice',
  'multiple_choice',
  'boolean',
  'short_text',
  'long_text',
] as const;

/** Types whose answers come from a fixed list, so options are required. */
export const CHOICE_TYPES = ['single_choice', 'multiple_choice'] as const;

export function needsOptions(questionType: string): boolean {
  return (CHOICE_TYPES as readonly string[]).includes(questionType);
}

const questionKey = z
  .string()
  .trim()
  .regex(
    /^[a-z][a-z0-9_]{1,62}$/,
    'Use lowercase letters, numbers and underscores, starting with a letter',
  );

export const createQuestionnaireSchema = z.object({
  organizationId: z.uuid(),
  name: z.string().trim().min(1, 'Enter a name').max(200),
  description: z.string().trim().max(2000).optional(),
});

export const addQuestionSchema = z.object({
  versionId: z.uuid(),
  questionKey,
  label: z.string().trim().min(1, 'Enter the question').max(500),
  helpText: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(100).optional(),
  questionType: z.enum(QUESTION_TYPES),
  required: z.coerce.boolean().optional(),
  /**
   * "Only ask below five stars" is the branching the specification calls for, and
   * the only one worth a control in the MVP. `condition_json` supports far more;
   * exposing an arbitrary rule builder before anyone has asked for one would be
   * a lot of UI guarding a lot of ways to configure something incoherent.
   */
  onlyBelowFive: z.coerce.boolean().optional(),
  /** One option per line. */
  options: z.string().max(4000).optional(),
});

export const removeQuestionSchema = z.object({
  versionId: z.uuid(),
  questionId: z.uuid(),
});

export const publishVersionSchema = z.object({ versionId: z.uuid() });

export const newDraftSchema = z.object({
  templateId: z.uuid(),
  organizationId: z.uuid(),
});

export const assignVersionSchema = z.object({
  versionId: z.uuid(),
  organizationId: z.uuid(),
  scope: z.enum(['all', 'selected', 'none']),
  locationIds: z.array(z.uuid()).max(200).default([]),
});

/**
 * Turns the textarea into options.
 *
 * The key is derived from the label so an operator never has to invent one, and
 * duplicates are dropped rather than rejected — two identically named options
 * would be indistinguishable in the results anyway.
 */
export function parseOptions(raw: string | undefined): Array<{ optionKey: string; label: string }> {
  if (!raw) return [];

  const seen = new Set<string>();
  const parsed: Array<{ optionKey: string; label: string }> = [];

  for (const line of raw.split('\n')) {
    const label = line.trim();
    if (!label) continue;

    const key = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60);

    // An option whose label has no usable characters cannot get a stable key.
    if (!key || !/^[a-z]/.test(key) || seen.has(key)) continue;

    seen.add(key);
    parsed.push({ optionKey: key, label: label.slice(0, 300) });
  }

  return parsed;
}
