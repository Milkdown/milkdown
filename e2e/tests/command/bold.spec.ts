import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, selectAll, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('toggle strong for paragraph', async ({ page }) => {
  await focusEditor(page)
  const paragraphMarkdown = await loadFixture('paragraph.md')
  await setMarkdown(page, paragraphMarkdown)

  await selectAll(page)
  await page.evaluate(() => window.commands.toggleStrong?.())

  await expect(page.locator('strong')).toHaveText('The lunatic is on the grass')
})

test('toggle strong for selection', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('Concorde flies in my room')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Tears the house to shreds')

  await page.evaluate(async () => {
    const document = window.document
    const el = document.querySelector('.editor p:first-child')
    if (!el) throw new Error('no paragraph')

    const range = document.createRange()
    range.selectNodeContents(el)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve()
      })
    })

    window.commands.toggleStrong?.()
  })

  await expect(page.locator('strong')).toHaveText('Concorde flies in my room')
})
