import { expect, test } from '@playwright/test'

import { focusEditor } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test('should be able to delete paragraph when slash menu displaying', async ({
  page,
}) => {
  const editor = page.locator('.editor')
  const blockHandle = page.locator('.milkdown-block-handle')
  const plusButton = blockHandle.locator('.operation-item').first()
  const slashMenu = page.locator('.milkdown-slash-menu')
  await focusEditor(page)
  const paragraph = editor.locator('p')
  await paragraph.hover()
  await expect(blockHandle).toBeVisible()
  await plusButton.click()
  await expect(slashMenu).toBeVisible()

  // delete the paragraph without close the slash menu
  await page.keyboard.press('Backspace')
  await expect(slashMenu).not.toBeVisible()

  await page.keyboard.press('/')
  await expect(slashMenu).toBeVisible()
})
