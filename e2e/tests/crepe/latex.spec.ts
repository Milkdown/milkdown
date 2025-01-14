import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from 'tests/misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test('latex block preview toggle', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('$$')
  await page.keyboard.press('Enter')

  const codeBlock = page.locator('milkdown-code-block')
  const codemirror = codeBlock.locator('.codemirror-host')
  const preview = codeBlock.locator('.preview')
  const codeTools = codeBlock.locator('.tools')
  const previewToggleButton = codeTools.locator('.preview-toggle-button')

  await expect(codeBlock).toBeVisible()

  // when code block is empty, preview toggle button is not visible
  await codeTools.hover()
  await expect(previewToggleButton).not.toBeVisible()

  await page.keyboard.press('ArrowUp')
  await page.keyboard.type('E=mc^2')

  await expect(preview).toBeVisible()
  const markdown = await getMarkdown(page)
  expect(markdown.trim()).toEqual('$$\nE=mc^2\n$$')

  await codeTools.hover()
  await expect(previewToggleButton).toBeVisible()

  await expect(codemirror).toBeVisible()
  await previewToggleButton.click()
  await expect(codemirror).not.toBeVisible()

  await previewToggleButton.click()
  await expect(codemirror).toBeVisible()
})

test('latex inline', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('$E=mc^2$')

  const inlineLatex = page.locator('span[data-type="math_inline"]')
  const inlineLatexInput = page.locator('milkdown-latex-inline-edit')
  const inlineLatexInputConfirm = inlineLatexInput.locator('button')

  await expect(inlineLatex).toBeVisible()

  let markdown = await getMarkdown(page)
  expect(markdown.trim()).toEqual('$E=mc^2$')

  await page.keyboard.press('ArrowLeft')
  await expect(inlineLatexInput).toBeVisible()

  await inlineLatexInput.click()
  await page.keyboard.press('Backspace')
  await page.keyboard.type('3')
  await page.keyboard.press('Enter')

  markdown = await getMarkdown(page)
  expect(markdown.trim()).toEqual('$E=mc^3$')

  await inlineLatexInput.click()
  await page.keyboard.press('Backspace')
  await page.keyboard.type('4')
  await inlineLatexInputConfirm.click()

  markdown = await getMarkdown(page)
  expect(markdown.trim()).toEqual('$E=mc^4$')
})
