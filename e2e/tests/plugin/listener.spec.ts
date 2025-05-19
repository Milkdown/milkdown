import { expect, test } from '@playwright/test'

import { focusEditor, selectAll } from '../misc'

test('on markdown updated', async ({ page }) => {
  await page.goto('/plugin-listener/?type=markdown')
  await focusEditor(page)
  await selectAll(page)
  await page.keyboard.press('ArrowRight')
  let msgPromise = page.waitForEvent('console')
  await page.keyboard.type('A')
  const msg = await msgPromise
  const [after, before] = msg.args()
  const afterText = await after?.jsonValue()
  const beforeText = await before?.jsonValue()
  expect(afterText).toBe('testA\n')
  expect(beforeText).toBe('test\n')

  msgPromise = page.waitForEvent('console')
  await page.keyboard.type('A')
  await expect(msgPromise).resolves.toBeTruthy()
})

test('on selection updated', async ({ page }) => {
  await page.goto('/plugin-listener/?type=selection')
  await focusEditor(page)
  await selectAll(page)
  const msgPromise = page.waitForEvent('console')
  await page.keyboard.press('ArrowRight')
  const msg = await msgPromise
  const [after, before] = msg.args()
  const afterText = await after?.jsonValue()
  const beforeText = await before?.jsonValue()

  expect(afterText).toBe('5-5')
  expect(beforeText).toBe('0-6')
})
