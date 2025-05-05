import { expect, test } from '@playwright/test'

import { focusEditor } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('chain command', async ({ page }) => {
  await focusEditor(page)
  const output = await page.evaluate(() => {
    const output: number[] = []

    const editor = window.__milkdown__
    const commandsCtx = window.__commandsCtx__
    const cmd = editor.ctx.get(commandsCtx)
    cmd
      .chain()
      .inline(() => {
        output.push(0)
        return false
      })
      .inline(() => {
        output.push(1)
        return true
      })
      .inline(() => {
        output.push(2)
        return true
      })
      .run()

    return output
  })

  expect(output).toEqual([0, 1])
})
