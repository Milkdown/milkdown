import { expect, test } from '@playwright/test'

import { focusEditor } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test('should not be able to change language in readonly mode', async ({
  page,
}) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('```ts')
  await page.keyboard.press('Enter')
  await page.keyboard.type('console.log("Hello, world!")')
  const codeBlock = editor.locator('.milkdown-code-block')
  const languagePicker = page.locator('.language-button')
  const languagePickerMenu = page.locator('.language-picker')

  await expect(codeBlock).toBeVisible()

  await codeBlock.hover()
  await expect(languagePicker).toBeVisible()

  await languagePicker.click()
  await expect(languagePickerMenu).toBeVisible()

  await languagePicker.click()
  await expect(languagePickerMenu).not.toBeVisible()

  await page.evaluate(() => {
    const crepe = window.__crepe__
    crepe.setReadonly(true)
  })

  // should not be able to change language in readonly mode
  await languagePicker.click()
  await expect(languagePickerMenu).not.toBeVisible()

  const codeBlockContentArea = page.locator('.cm-content')
  await expect(codeBlockContentArea).toHaveText('console.log("Hello, world!")')

  // type should not be reflected
  await codeBlockContentArea.focus()
  await page.keyboard.type('123')
  await expect(codeBlockContentArea).toHaveText('console.log("Hello, world!")')

  await page.evaluate(() => {
    const crepe = window.__crepe__
    crepe.setReadonly(false)
  })

  await codeBlockContentArea.focus()
  await page.keyboard.type('123')
  await expect(codeBlockContentArea).toHaveText(
    'console.log("Hello, world!")123'
  )

  await codeBlock.hover()
  await expect(languagePicker).toBeVisible()

  await languagePicker.click()
  await expect(languagePickerMenu).toBeVisible()
})
