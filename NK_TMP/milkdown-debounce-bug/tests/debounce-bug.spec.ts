import { test, expect } from '@playwright/test'

test.skip('rapid typing produces too many callbacks (bug demonstration -- SKIPPED: bug is now fixed)', async ({ page }) => {
  // This test demonstrated the bug BEFORE the fix was applied.
  // With the fix in packages/plugins/plugin-listener/src/index.ts,
  // debounce now works correctly and callbackCount is 1-3, not >3.
  // Collect console messages with our marker
  const debounceLogs: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[markdownUpdated]')) {
      debounceLogs.push(text)
    }
  })

  await page.goto('/')

  // Wait for the milkdown editor to render
  const editor = page.locator('[contenteditable="true"]')
  await editor.waitFor({ state: 'visible', timeout: 10000 })

  // Focus the editor and position cursor at end
  await editor.click()
  await page.keyboard.press('End')

  // Type 10 characters rapidly (30ms between keys).
  // Total typing time ~270ms, well within a single 200ms debounce window
  // (the last keystroke at t=270ms would start a new 200ms timer).
  // With proper debouncing we'd expect 1-3 callbacks.
  // With the bug, each keystroke fires its own independent timer => ~10 callbacks.
  await page.keyboard.type('abcdefghij', { delay: 30 })

  // Wait for all debounce timers to fire (200ms after last keystroke + buffer)
  await page.waitForTimeout(500)

  // Read the callback count from the DOM
  const countText = await page.locator('#callback-count').textContent()
  const callbackCount = Number(countText)

  // eslint-disable-next-line no-console
  console.log(`[test] DOM callback count: ${callbackCount}, console log count: ${debounceLogs.length}`)

  // BUG ASSERTION: With the debounce bug, we expect many callbacks (one per keystroke).
  // This test PROVES the bug exists by asserting count > 3.
  expect(callbackCount).toBeGreaterThan(3)
})

test('after fix, rapid typing produces at most 3 callbacks', async ({ page }) => {
  // The debounce fix has been applied in
  // packages/plugins/plugin-listener/src/index.ts

  const debounceLogs: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[markdownUpdated]')) {
      debounceLogs.push(text)
    }
  })

  await page.goto('/')

  const editor = page.locator('[contenteditable="true"]')
  await editor.waitFor({ state: 'visible', timeout: 10000 })

  await editor.click()
  await page.keyboard.press('End')

  await page.keyboard.type('abcdefghij', { delay: 30 })
  await page.waitForTimeout(500)

  const countText = await page.locator('#callback-count').textContent()
  const callbackCount = Number(countText)

  // eslint-disable-next-line no-console
  console.log(`[test] DOM callback count: ${callbackCount}, console log count: ${debounceLogs.length}`)

  // FIX ASSERTION: With proper debouncing, rapid typing should produce at most 3 callbacks.
  // Timing variance may cause 2-3 debounce windows, but never 10.
  expect(callbackCount).toBeLessThanOrEqual(3)
  expect(callbackCount).toBeGreaterThanOrEqual(1)
})
