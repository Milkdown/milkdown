import type { Locator } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { focusEditor, setMarkdown, waitNextFrame } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('cannot measure element')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box }
}

test('should be able to drag and drop a list item', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await setMarkdown(page, '- item 1\n- item 2\n- item 3\n- item 4\n')
  await waitNextFrame(page)

  const items = editor.locator('ul li')
  await expect(items).toHaveCount(4)

  await items.nth(1).hover()
  const blockHandle = page.locator('.milkdown-block-handle')
  await expect(blockHandle).toBeVisible()

  // The first operation item is the add button, the second one is the drag
  // handle.
  const { x: originX, y: originY } = await centerOf(
    blockHandle.locator('.operation-item').nth(1)
  )
  const { x: targetX, box: targetBox } = await centerOf(items.nth(3))

  await page.mouse.move(originX, originY)
  await page.mouse.down()
  // Two moves: the first one starts the native drag, the second one lands on
  // the bottom half of the last item so the drop point is after it.
  await page.mouse.move(targetX, targetBox.y, { steps: 10 })
  await waitNextFrame(page)
  await page.mouse.move(targetX, targetBox.y + targetBox.height - 2, {
    steps: 5,
  })
  await waitNextFrame(page)
  await page.mouse.up()
  await waitNextFrame(page)

  // The moved item should not leave an empty item behind.
  await expect(items).toHaveCount(4)
  await expect(items.nth(0)).toContainText('item 1')
  await expect(items.nth(1)).toContainText('item 3')
  await expect(items.nth(2)).toContainText('item 4')
  await expect(items.nth(3)).toContainText('item 2')
})
