import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('code block', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('```markdown')
  await page.keyboard.press('Enter')
  await page.keyboard.type('# Hi markdown')
  await expect(editor.locator('pre')).toHaveAttribute(
    'data-language',
    'markdown'
  )
  await expect(editor.locator('code')).toHaveText('# Hi markdown')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('```markdown\n# Hi markdown\n```\n')
})
