import { expect, test } from "@playwright/test";
import { focusEditor, getMarkdown } from "../misc";

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/');
})

test('heading', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page);
  await page.keyboard.type('# Heading1')
  await expect(editor.locator('h1')).toHaveText('Heading1')
  await expect(editor.locator('h1')).toHaveAttribute('id', 'heading1')
  const markdown = await getMarkdown(page);
  expect(markdown).toBe('# Heading1\n');

  await page.keyboard.press('Enter');
  await page.keyboard.type('## Heading 2')
  await expect(editor.locator('h2')).toHaveText('Heading 2')
  await expect(editor.locator('h2')).toHaveAttribute('id', 'heading-2')
  const markdown2 = await getMarkdown(page);
  expect(markdown2).toBe('# Heading1\n\n## Heading 2\n');
});
