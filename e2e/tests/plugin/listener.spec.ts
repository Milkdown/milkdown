import { expect, test } from '@playwright/test'
import { focusEditor, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/plugin-listener/')
})

test('on markdown updated', async ({ page }) => {
  await focusEditor(page)
  await selectAll(page)
  await page.keyboard.press('ArrowRight')
  let msgPromise = page.waitForEvent('console')
  await page.keyboard.type('A')
  const msg = await msgPromise
  const [after, before] = msg.args()
  expect(await after?.jsonValue()).toBe('testA\n')
  expect(await before?.jsonValue()).toBe('test\n')

  msgPromise = page.waitForEvent('console')
  await page.keyboard.type('A')
  await expect(msgPromise).resolves.toBeTruthy()
})
