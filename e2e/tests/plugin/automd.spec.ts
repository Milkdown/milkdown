import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown, waitNextFrame } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/plugin-automd/')
})

test.describe('keep mark symbol', () => {
  test('strong with _', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is __on the grass__')
    await expect(page.locator('.editor strong')).toHaveText('on the grass')
    expect(await getMarkdown(page)).toBe('The lunatic is __on the grass__\n')
  })

  test('strong with *', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is **on the grass**')
    await expect(page.locator('.editor strong')).toHaveText('on the grass')
    expect(await getMarkdown(page)).toBe('The lunatic is **on the grass**\n')
  })

  test('not a bold', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is o__"n the grass__')
    await expect(page.locator('.editor p')).toHaveText(
      'The lunatic is o__"n the grass__'
    )
    expect(await getMarkdown(page)).toBe(
      'The lunatic is o\\_\\_"n the grass\\_\\_\n'
    )
  })

  test('escape _', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is \\_\\_on the grass__')
    expect(await page.locator('.editor em').count()).toBe(0)
    await expect(page.locator('.editor')).toContainText(
      '_\u200B_on the grass__'
    )
  })

  test('italic with _', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is "_on the grass_"')
    await expect(page.locator('.editor em')).toHaveText('on the grass')
    expect(await getMarkdown(page)).toBe('The lunatic is "_on the grass_"\n')
  })

  test('not an italic', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is o*"n the grass*')
    await expect(page.locator('.editor p')).toHaveText(
      'The lunatic is o*"n the grass*'
    )
    expect(await getMarkdown(page)).toBe('The lunatic is o\\*"n the grass\\*\n')
  })

  test('italic with *', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is "*on the grass*"')
    await expect(page.locator('.editor em')).toHaveText('on the grass')
    expect(await getMarkdown(page)).toBe('The lunatic is "*on the grass*"\n')
  })

  test('escape _ in italic', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is \\_on the grass_')
    expect(await page.locator('.editor em').count()).toBe(0)
    await expect(page.locator('.editor')).toContainText('_on the grass_')
  })

  test('escape * in italic', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is \\*on the grass*')
    expect(await page.locator('.editor em').count()).toBe(0)
    await expect(page.locator('.editor')).toContainText('*on the grass*')
  })

  test('escape _ in bold', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is \\_\\_on the grass__')
    expect(await page.locator('.editor em').count()).toBe(0)
    await expect(page.locator('.editor')).toContainText(
      '_\u200B_on the grass__'
    )
  })

  test('escape * in bold', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is \\*\\*on the grass**')
    expect(await page.locator('.editor strong').count()).toBe(0)
    await expect(page.locator('.editor')).toContainText(
      '*\u200B*on the grass**'
    )
  })

  test('link', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is [on the grass](url)')
    await expect(page.locator('.editor a')).toHaveText('on the grass')
    await expect(page.locator('.editor a')).toHaveAttribute('href', 'url')
    expect(await getMarkdown(page)).toBe('The lunatic is [on the grass](url)\n')
  })

  test('inline code with * and _', async ({ page }) => {
    await focusEditor(page)
    await page.keyboard.type('The lunatic is `__`')
    await waitNextFrame(page)
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.type('**on the grass**')
    await expect(page.locator('code')).toHaveText('_**on the grass**_')
    expect(await getMarkdown(page)).toBe(
      'The lunatic is `_**on the grass**_`\n'
    )
  })
})

test('image', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('![image](invalidUrl)')
  await waitNextFrame(page)
  expect(await getMarkdown(page)).toBe('![image](invalidUrl)\n')
})

test('auto link', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('https://milkdown.dev')
  await waitNextFrame(page)
  await expect(page.locator('.editor a')).toHaveText('https://milkdown.dev')
  expect(await getMarkdown(page)).toBe('<https://milkdown.dev>\n')
})

test('with plugin listener', async ({ page }) => {
  await focusEditor(page)
  let msgPromise = page.waitForEvent('console')
  await page.keyboard.type('*')
  let msg = await msgPromise
  const [msg1] = msg.args()
  expect(await msg1?.jsonValue()).toBe('\\*\n')

  msgPromise = page.waitForEvent('console')
  await page.keyboard.type('A')
  msg = await msgPromise
  const [msg2] = msg.args()
  expect(await msg2?.jsonValue()).toBe('\\*A\n')

  msgPromise = page.waitForEvent('console')
  await page.keyboard.type('*')
  await msgPromise

  msgPromise = page.waitForEvent('console')
  msg = await msgPromise
  const [msg4] = msg.args()
  expect(await msg4?.jsonValue()).toBe('*A*\n')
})
