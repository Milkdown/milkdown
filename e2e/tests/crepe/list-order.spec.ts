import { expect, test } from '@playwright/test'

import { getMarkdown, setMarkdown, waitNextFrame } from '../misc'

test('normalizes a moved ordered item without changing preceding content', async ({
  page,
}) => {
  await page.goto('/crepe/')
  const editor = page.locator('.editor')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await setMarkdown(
    page,
    '### Heading stays small\n\nIntroduction stays unchanged.\n\n' +
      '1. First item\n2. Second item\n\n* Bullet one\n* Bullet two\n'
  )
  await waitNextFrame(page)

  await editor.locator('ol li').nth(1).hover()
  const handle = page.locator('.milkdown-block-handle .operation-item').nth(1)
  await expect(handle).toBeVisible()
  const origin = await handle.boundingBox()
  const target = await editor.locator('ul li').first().boundingBox()
  if (!origin || !target) throw new Error('cannot measure list drag targets')

  const targetX = target.x + target.width / 2
  await page.mouse.move(
    origin.x + origin.width / 2,
    origin.y + origin.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(targetX, target.y - 8, { steps: 10 })
  await waitNextFrame(page)
  await page.mouse.move(targetX, target.y + 2, { steps: 5 })
  await waitNextFrame(page)
  await page.mouse.up()
  await waitNextFrame(page)

  expect(errors).toEqual([])
  await expect(editor.locator('h3')).toHaveText('Heading stays small')
  await expect(editor.locator('ol')).toHaveCount(2)
  await expect(editor.locator('.label.ordered')).toHaveText([
    '1.',
    '1.',
    '2.',
    '3.',
  ])
  expect(await getMarkdown(page)).toBe(
    '### Heading stays small\n\nIntroduction stays unchanged.\n\n' +
      '1. First item\n\n1) Second item\n\n2) Bullet one\n\n3) Bullet two\n'
  )
})
