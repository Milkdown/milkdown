import { expect, test } from '@playwright/test'
import { focusEditor } from 'tests/misc'

test('listen change before editor is created', async ({ page }) => {
  await page.addInitScript(() => {
    window.__beforeCrepeCreate__ = (crepe) => {
      crepe.on((listener) => {
        listener.markdownUpdated((_, markdown) => {
          // oxlint-disable-next-line no-console
          console.log('markdown', markdown)
        })
      })
    }
  })
  await page.goto('/crepe/')

  const messagePromise = page.waitForEvent('console', (msg) => {
    return msg.text().includes('Hello')
  })

  await focusEditor(page)
  await page.keyboard.type('Hello')

  const message = await messagePromise
  const log: string = await message.args()[1]?.jsonValue()
  expect(log.trim()).toBe('Hello')
})

test('listen change after editor is created', async ({ page }) => {
  await page.addInitScript(() => {
    window.__afterCrepeCreated__ = (crepe) => {
      crepe.on((listener) => {
        listener.markdownUpdated((_, markdown) => {
          // oxlint-disable-next-line no-console
          console.log('markdown', markdown)
        })
      })
    }
  })
  await page.goto('/crepe/')

  const messagePromise = page.waitForEvent('console', (msg) => {
    return msg.text().includes('World')
  })

  await focusEditor(page)
  await page.keyboard.type('World')

  const message = await messagePromise
  const log: string = await message.args()[1]?.jsonValue()
  expect(log.trim()).toBe('World')
})
