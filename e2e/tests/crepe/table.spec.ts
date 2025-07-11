import { expect, test } from '@playwright/test'
import { waitNextFrame } from 'tests/misc'

import { TablePageObjectModel } from './table.pom'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test('should be able to use column picker to delete a column', async ({
  page,
}) => {
  const pom = new TablePageObjectModel(page)
  await pom.addTable()

  await expect(pom.cellsInRow(0)).toHaveCount(3)

  const firstCell = pom.cell(0, 0)

  await page.keyboard.type('First Cell')
  await expect(firstCell).toContainText('First Cell')

  await firstCell.hover()
  await expect(pom.colPicker()).toBeVisible()

  await pom.colPicker().click()
  await expect(pom.colButtonGroup()).toBeVisible()

  const deleteButton = pom.colButtonGroup().locator('button').last()
  await deleteButton.click()

  await expect(pom.cellsInRow(0)).toHaveCount(2)
})

test('should be able to drag and drop a column', async ({ page }) => {
  const pom = new TablePageObjectModel(page)
  await pom.addTable()

  await page.keyboard.type('First Cell')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Second Cell')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Third Cell')

  const firstCell = pom.cell(0, 0)
  const secondCell = pom.cell(0, 1)
  const thirdCell = pom.cell(0, 2)

  await expect(firstCell).toContainText('First Cell')
  await expect(secondCell).toContainText('Second Cell')
  await expect(thirdCell).toContainText('Third Cell')

  await firstCell.hover()
  const colPicker = pom.colPicker()
  await expect(colPicker).toBeVisible()

  const {
    x: originX,
    y: originY,
    height,
  } = await colPicker.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      height: rect.height,
    }
  })

  const targetX = await thirdCell.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return rect.x + rect.width / 2
  })

  await page.mouse.move(originX, originY)
  await page.mouse.down()
  // try to move the mouse out of the table to make sure it works
  await page.mouse.move(targetX, originY - height, { steps: 10 })
  await waitNextFrame(page)

  const previewTable = pom.previewTable()
  await expect(previewTable).toHaveAttribute('data-direction', 'horizontal')
  await expect(pom.previewCells()).toHaveCount(3)
  await expect(pom.previewCellsInRow(0)).toHaveText('First Cell')
  await waitNextFrame(page)

  await page.mouse.up()

  await expect(firstCell).toContainText('Second Cell')
  await expect(secondCell).toContainText('Third Cell')
  await expect(thirdCell).toContainText('First Cell')
})

test('should be able to drag and drop a row', async ({ page }) => {
  const pom = new TablePageObjectModel(page)
  await pom.addTable()

  await page.keyboard.type('First Cell')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.type('Second Cell')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.type('Third Cell')

  const firstCell = pom.cell(0, 0)
  const secondCell = pom.cell(1, 0)
  const thirdCell = pom.cell(2, 0)

  await expect(firstCell).toContainText('First Cell')
  await expect(secondCell).toContainText('Second Cell')
  await expect(thirdCell).toContainText('Third Cell')

  await firstCell.hover()
  const rowPicker = pom.rowPicker()
  await expect(rowPicker).toBeVisible()

  const {
    x: originX,
    y: originY,
    width,
  } = await rowPicker.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      width: rect.width,
    }
  })

  const targetY = await thirdCell.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return rect.y + rect.height / 2
  })

  await page.mouse.move(originX, originY)
  await page.mouse.down()
  // try to move the mouse out of the table to make sure it works
  await page.mouse.move(originX - width, targetY, { steps: 10 })
  await waitNextFrame(page)

  const previewTable = pom.previewTable()
  await expect(previewTable).toHaveAttribute('data-direction', 'vertical')
  await expect(pom.previewCells()).toHaveCount(3)
  await expect(pom.previewCell(0, 0)).toHaveText('First Cell')
  await waitNextFrame(page)

  await page.mouse.up()

  await expect(firstCell).toContainText('Second Cell')
  await expect(secondCell).toContainText('Third Cell')
  await expect(thirdCell).toContainText('First Cell')
})
