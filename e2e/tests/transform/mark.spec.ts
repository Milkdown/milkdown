import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('mark', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('cm-mark.md')
  await setMarkdown(page, markdown)

  const text = 'The lunatic is on the grass'

  await expect(page.locator('strong').first()).toHaveText(text)
  await expect(page.locator('em').first()).toHaveText(text)
  await expect(page.locator('code').first()).toHaveText(text)
  await expect(page.locator('a').first()).toHaveText(text)
  await expect(page.locator('a').first()).toHaveAttribute('href', 'link')

  await expect(page.locator('p').nth(4).locator('strong')).toHaveText(text)
  await expect(page.locator('p').nth(4).locator('em')).toHaveText(text)

  await expect(page.locator('p').nth(5).locator('strong')).toHaveText(text)
  await expect(page.locator('p').nth(5).locator('em')).toHaveText(text)
  await expect(page.locator('p').nth(5).locator('code')).toHaveText(text)

  await expect(page.locator('p').last().locator('strong')).toHaveText(text)
  await expect(page.locator('p').last().locator('em')).toHaveText(text)
  await expect(page.locator('p').last().locator('a')).toHaveText(text)

  const readMarkdown = await getMarkdown(page)
  expect(readMarkdown).toBe(
    '**The lunatic is on the grass**\n\n_The lunatic is on the grass_\n\n`The lunatic is on the grass`\n\n[The lunatic is on the grass](link)\n\n_**The lunatic is on the grass**_\n\n_**`The lunatic is on the grass`**_\n\n_**[The lunatic is on the grass](link)**_\n'
  )
})
