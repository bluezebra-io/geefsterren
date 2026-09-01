import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const LEIDEN_TOKEN = 'DemoLeiden00001';
const LEIDEN_LOCATION = '33333333-3333-4333-8333-000000000001';

/**
 * The MVP loop: a guest scans a QR, answers, and the result shows up per question.
 *
 * Uses a real browser because the branching happens client-side and the
 * submission goes through a Server Action — neither is observable from the HTML
 * alone, since question labels travel in the RSC payload whether or not they are
 * rendered.
 */
function service() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Finds submissions by their comment.
 *
 * Counting every submission for the location would make these tests depend on
 * each other: the suite runs in parallel and several tests write to the same
 * location, so a global count is somebody else's number by the time it is read.
 * A unique marker per test is independent by construction.
 */
/**
 * A marker unique to this run, not just to this test.
 *
 * `testInfo.testId` is stable across runs, so reusing it alone made the second
 * run find two submissions and fail an assertion about the first.
 */
function marker(prefix: string, testId: string): string {
  return `${prefix}-${testId}-${Date.now()}`;
}

/** Removes what a test wrote, so the seeded statistics stay meaningful. */
async function cleanUp(commentMarker: string) {
  await service().from('feedback_submissions').delete().eq('free_text_comment', commentMarker);
}

async function submissionsWithComment(marker: string) {
  const { data, error } = await service()
    .from('feedback_submissions')
    .select('id, overall_score, free_text_comment, feedback_answers(question_id, selected_option_id)')
    .eq('location_id', LEIDEN_LOCATION)
    .eq('free_text_comment', marker);
  if (error) throw error;
  return data ?? [];
}

/**
 * These tests use the seeded QR token, which is the only plain token anything
 * outside the portal can know — the rest are stored hashed and encrypted.
 *
 * That makes the suite depend on a freshly seeded database, and reissuing that QR
 * in the portal invalidates it. Checking it up front turns a confusing 30-second
 * timeout into an actionable message.
 */
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const response = await page.goto(`http://localhost:5010/r/${LEIDEN_TOKEN}`);
  const body = await page.locator('body').innerText();
  await page.close();

  if (response?.status() !== 200 || /not active|niet actief/i.test(body)) {
    throw new Error(
      `The seeded QR token ${LEIDEN_TOKEN} no longer resolves. Run \`npm run db:reset\` — ` +
        'reissuing that QR in the portal replaces its token.',
    );
  }
});

test('an unknown token gets a neutral message', async ({ page }) => {
  await page.goto('http://localhost:5010/r/ThisTokenDoesNotExist');
  const message = page.getByText(/not active|niet actief/i);
  await expect(message).toBeVisible();

  // It must not say why — an expired campaign and an unknown code read alike.
  // Scoped to the surrounding card, because Next's dev overlay adds its own text
  // to the page and an unscoped match picks that up.
  const card = page.locator('div', { has: message }).last();
  await expect(card).not.toContainText(/expired|verlopen|unknown|onbekend/i);
});

test('the rating control is a real radiogroup', async ({ page }) => {
  await page.goto(`http://localhost:5010/r/${LEIDEN_TOKEN}`);

  const group = page.getByRole('radiogroup');
  await expect(group).toBeVisible();
  await expect(group.getByRole('radio')).toHaveCount(5);

  // Keyboard: one tab stop, then arrows move the selection.
  await group.getByRole('radio').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { checked: true })).toHaveAccessibleName(/3 of 5|3 van 5/);
});

test('a five-star guest is not asked what went wrong', async ({ page }) => {
  await page.goto(`http://localhost:5010/r/${LEIDEN_TOKEN}`);

  await page.getByRole('radio').nth(4).click();
  await expect(page.getByRole('heading', { name: /what went well|wat ging er goed/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /where can we improve|waar kunnen we verbeteren/i })).toHaveCount(0);
});

test('a lower score gets the diagnostic follow-up instead', async ({ page }) => {
  await page.goto(`http://localhost:5010/r/${LEIDEN_TOKEN}`);

  await page.getByRole('radio').nth(1).click();
  await expect(page.getByRole('heading', { name: /where can we improve|waar kunnen we verbeteren/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /what went well|wat ging er goed/i })).toHaveCount(0);
});

test('submitting feedback stores the score, the comment and the chosen topics', async ({ page }, testInfo) => {
  const commentMarker = marker('playwright-loop', testInfo.testId);

  await page.goto(`http://localhost:5010/r/${LEIDEN_TOKEN}`);
  await page.getByRole('radio').nth(2).click(); // score 3

  await page.getByRole('button', { name: /^(temperature|temperatuur)$/i }).click();
  await page.getByRole('button', { name: /^(taste|smaak)$/i }).click();
  await page.getByLabel(/anything else|iets toelichten/i).fill(commentMarker);

  await page.getByRole('button', { name: /send feedback|verstuur feedback/i }).click();
  await expect(page.getByRole('heading', { name: /thank you|bedankt/i })).toBeVisible();
  await expect(page.getByText(/3\/5/)).toBeVisible();

  const rows = await submissionsWithComment(commentMarker);
  expect(rows).toHaveLength(1);
  expect(rows[0].overall_score).toBe(3);

  // Exactly the two topics chosen, plus the rating and the comment as answers.
  const optionAnswers = rows[0].feedback_answers.filter((a) => a.selected_option_id !== null);
  expect(optionAnswers).toHaveLength(2);

  await cleanUp(commentMarker);
});

test('a five-star guest records an appreciation topic, not an improvement one', async ({ page }, testInfo) => {
  const commentMarker = marker('playwright-five', testInfo.testId);

  await page.goto(`http://localhost:5010/r/${LEIDEN_TOKEN}`);
  await page.getByRole('radio').nth(4).click();
  await page.getByRole('button', { name: /^(taste|smaak)$/i }).click();
  await page.getByLabel(/anything else|iets toelichten/i).fill(commentMarker);
  await page.getByRole('button', { name: /send feedback|verstuur feedback/i }).click();
  await expect(page.getByRole('heading', { name: /thank you|bedankt/i })).toBeVisible();

  const rows = await submissionsWithComment(commentMarker);
  expect(rows).toHaveLength(1);
  expect(rows[0].overall_score).toBe(5);

  // The stored answer belongs to the appreciation question, which is the only one
  // a five-star guest was shown.
  const { data, error } = await service()
    .from('questions')
    .select('id, question_key')
    .in('question_key', ['improvement_topics', 'positive_topics']);
  if (error) throw error;

  const positiveId = data.find((q) => q.question_key === 'positive_topics')?.id;
  const improvementId = data.find((q) => q.question_key === 'improvement_topics')?.id;
  const answered = rows[0].feedback_answers.map((a) => a.question_id);

  expect(answered).toContain(positiveId);
  expect(answered).not.toContain(improvementId);

  await cleanUp(commentMarker);
});
