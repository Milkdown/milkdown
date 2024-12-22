import type { Page } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function focusEditor(page: Page) {
  const editor = page.locator('.editor')
  await editor.focus()
}

export async function getMarkdown(page: Page) {
  return await page.evaluate(() => {
    return window.__getMarkdown__()
  })
}

export async function setMarkdown(page: Page, markdown: string) {
  await page.evaluate((markdown: string) => {
    window.__setMarkdown__(markdown)
  }, markdown)
}

export async function loadFixture(filePath: string) {
  return await fs.readFile(path.join(__dirname, '../data', filePath), 'utf-8')
}

export async function pressMetaKey(page: Page) {
  const isMac = process.platform === 'darwin'
  const key = isMac ? 'Meta' : 'Control'
  await page.keyboard.down(key)
  return () => page.keyboard.up(key)
}

export async function selectAll(page: Page) {
  const up = await pressMetaKey(page)
  await page.keyboard.press('KeyA')
  await up()
}

export async function paste(
  page: Page,
  payload: Record<string, string>,
  selector = '.editor'
) {
  await page.evaluate(
    async ({ payload, selector }) => {
      const pasteEvent = Object.assign(
        new Event('paste', { bubbles: true, cancelable: true }),
        {
          clipboardData: {
            getData: (key: string) => (payload[key] ? payload[key] : ''),
          },
        }
      )
      const editor = document.querySelector(selector)
      editor?.dispatchEvent(pasteEvent)
    },
    { payload, selector }
  )
}

export async function waitNextFrame(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve()
        })
      })
    })
  })
}
