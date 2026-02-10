import { expect, test } from '@playwright/test'

import { focusEditor, selectAll, waitNextFrame } from '../misc'

test('on markdown updated', async ({ page }) => {
  await page.goto('/plugin-listener/?type=markdown')
  await focusEditor(page)
  await selectAll(page)
  await page.keyboard.press('ArrowRight')
  await waitNextFrame(page)
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

test('markdownUpdated is properly debounced during rapid typing', async ({
  page,
}) => {
  await page.goto('/plugin-listener/?type=debounce')
  await focusEditor(page)
  await waitNextFrame(page)

  // Collect all debounce-test console messages
  const debounceLogs: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[debounce-test]')) {
      debounceLogs.push(text)
    }
  })

  // Type 10 characters rapidly (30ms between keys, well within 200ms debounce)
  await page.keyboard.type('abcdefghij', { delay: 30 })

  // Wait for debounce to fire (200ms after last keystroke + buffer)
  await page.waitForTimeout(500)

  // With proper debouncing, we expect at most 3 callbacks
  // (timing variance may cause 2-3 debounce windows, but never 10)
  expect(debounceLogs.length).toBeGreaterThanOrEqual(1)
  expect(debounceLogs.length).toBeLessThanOrEqual(3)
})
