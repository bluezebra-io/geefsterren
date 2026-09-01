import { expect, test } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const PORTAL = 'http://app.localhost:5010';

/**
 * Authoring questionnaires: the organization-administrator flow.
 *
 * Runs in serial because it creates a questionnaire and then walks it through
 * publishing and assignment — the steps depend on each other by nature.
 */
test.describe.configure({ mode: 'serial' });

async function sessionCookies(email: string) {
  const jar = new Map<string, string>();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
      },
    },
  );
  const { error } = await sb.auth.signInWithPassword({ email, password: 'LocalDev!2026' });
  if (error) throw new Error(`${email}: ${error.message}`);
  return [...jar].map(([name, value]) => ({
    name,
    value,
    domain: 'app.localhost',
    path: '/',
  }));
}

test('an organization administrator authors, publishes and assigns a questionnaire', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('org.admin@bakkerij.test'));
  const page = await context.newPage();

  const name = `Testlijst ${Date.now()}`;

  // The seeded platform template must be visible to start from.
  await page.goto(`${PORTAL}/app/questionnaires`);
  await expect(page.getByText('Standaard horeca-vragenlijst')).toBeVisible();
  await expect(page.getByText('Platformsjabloon').first()).toBeVisible();

  // Create a questionnaire; it opens straight into its draft.
  await page.getByLabel('Naam').fill(name);
  await page.getByRole('button', { name: /^Aanmaken$/ }).click();
  await expect(page).toHaveURL(/\/app\/questionnaires\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  await expect(page.getByText('Concept', { exact: true })).toBeVisible();

  // A draft with no questions cannot be published, so no button is offered yet.
  await expect(page.getByRole('button', { name: /^Publiceren$/ })).toHaveCount(0);

  // Add a rating question.
  await page.getByLabel('Vraag', { exact: true }).fill('Hoe was je bezoek?');
  await page.getByLabel('Type').selectOption('rating');
  await page.getByRole('button', { name: /^Toevoegen$/ }).click();
  await expect(page.getByText('Hoe was je bezoek?')).toBeVisible();

  // Add a conditional multiple choice with options.
  await page.getByLabel('Vraag', { exact: true }).fill('Wat kan beter?');
  await page.getByLabel('Type').selectOption('multiple_choice');
  await page.getByLabel('Antwoordopties').fill('Wachttijd\nSfeer\nPrijs');
  await page.getByLabel(/Alleen stellen bij een score onder vijf/).check();
  await page.getByRole('button', { name: /^Toevoegen$/ }).click();

  await expect(page.getByText('Wat kan beter?')).toBeVisible();
  await expect(page.getByText('Wachttijd · Sfeer · Prijs')).toBeVisible();

  // Assignment is refused until the version is published.
  await expect(page.getByText(/Publiceer deze versie voordat/)).toBeVisible();

  // Publishing asks for confirmation, because it cannot be undone.
  await page.getByRole('button', { name: /^Publiceren$/ }).click();
  await expect(page.getByText(/Na publiceren staan de vragen vast/)).toBeVisible();
  await page.getByRole('button', { name: /^Publiceren$/ }).last().click();

  await expect(page.getByText('Gepubliceerd', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/kan niet meer wijzigen/)).toBeVisible();

  // Published means no more editing: the add form is gone.
  await expect(page.getByRole('button', { name: /^Toevoegen$/ })).toHaveCount(0);

  // Assign to a selection of locations.
  await page.getByRole('radio', { name: 'Alleen deze vestigingen' }).check();
  await page.getByRole('checkbox', { name: 'De Korenaar Rotterdam' }).check();
  await page.getByRole('button', { name: /^Opslaan$/ }).click();
  await expect(page.getByText('Wijzigingen opgeslagen.')).toBeVisible({ timeout: 15_000 });

  // And the overview reflects it.
  await page.goto(`${PORTAL}/app/questionnaires`);
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText(/1 vestigingen/)).toBeVisible();

  await context.close();
});

/**
 * Removes what the authoring test created.
 *
 * Without this the next run inherits an active assignment for the same location,
 * and assigning a second questionnaire there would legitimately conflict — the
 * test would fail on its own leftovers rather than on the code.
 */
test.afterAll(async () => {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: templates } = await admin
    .from('questionnaire_templates')
    .select('id')
    .like('name', 'Testlijst %');

  for (const template of templates ?? []) {
    const { data: versions } = await admin
      .from('questionnaire_versions')
      .select('id')
      .eq('questionnaire_template_id', template.id);

    for (const version of versions ?? []) {
      await admin
        .from('location_questionnaire_assignments')
        .delete()
        .eq('questionnaire_version_id', version.id);
      // Published versions refuse deletion by design, so archive instead.
      await admin.from('questionnaire_versions').update({ status: 'archived' }).eq('id', version.id);
    }

    await admin.from('questionnaire_templates').update({ status: 'archived' }).eq('id', template.id);
  }

  // Restore the seeded organization-wide assignment the test displaced.
  await admin
    .from('location_questionnaire_assignments')
    .update({ status: 'active' })
    .is('location_id', null)
    .eq('questionnaire_version_id', '77777777-7777-4777-8777-000000000001');
});

test('a viewer cannot author questionnaires', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('viewer@bakkerij.test'));
  const page = await context.newPage();

  await page.goto(`${PORTAL}/app/questionnaires`);

  // Read access, but none of the authoring controls.
  await expect(page.getByText('Standaard horeca-vragenlijst')).toBeVisible();
  await expect(page.getByRole('button', { name: /Nieuw concept/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Aanmaken$/ })).toHaveCount(0);

  await context.close();
});
