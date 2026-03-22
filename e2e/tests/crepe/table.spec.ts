import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown, paste, waitNextFrame } from 'tests/misc'

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

const googleDocsTableWithoutHeader = `
<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-f6b4556f-7fff-8b1b-04af-fd6b1414db62"><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;table-layout:fixed;width:468pt"><colgroup><col /><col /><col /></colgroup><tbody><tr style="height:0pt"><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">111</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">222</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">333</span></p></td></tr><tr style="height:0pt"><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">444</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">555</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">666</span></p></td></tr><tr style="height:0pt"><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">777</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">aaa</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">bbb</span></p></td></tr></tbody></table></div></b>
`.trim()

const expectedMarkdown = `
| 111 | 222 | 333 |
| :-- | :-- | :-- |
| 444 | 555 | 666 |
| 777 | aaa | bbb |
`.trim()

test('paste missing header tables', async ({ page }) => {
  await focusEditor(page)
  await paste(page, {
    'text/html': googleDocsTableWithoutHeader,
  })
  await waitNextFrame(page)
  expect((await getMarkdown(page)).includes(expectedMarkdown)).toBeTruthy()

  // Ensure the table is interactive
  const pom = new TablePageObjectModel(page)
  const firstCell = pom.cell(0, 0)
  await firstCell.click()
  await page.keyboard.type('First Header Cell')
  await expect(firstCell).toContainText('First Header Cell')
})

const googleDocsThreeRowTable = `
<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-test"><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;table-layout:fixed;width:468pt"><colgroup><col /><col /><col /></colgroup><tbody><tr style="height:0pt"><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>A1</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>B1</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>C1</span></p></td></tr><tr style="height:0pt"><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>A2</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>B2</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>C2</span></p></td></tr><tr style="height:0pt"><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>A3</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>B3</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>C3</span></p></td></tr></tbody></table></div></b>
`.trim()

test('paste google docs table promotes first row to header', async ({
  page,
}) => {
  await focusEditor(page)
  await paste(page, {
    'text/html': googleDocsThreeRowTable,
  })
  await waitNextFrame(page)
  const md = await getMarkdown(page)
  expect(md.includes('| A1 | B1 | C1 |')).toBeTruthy()
  expect(md.includes('| A2 | B2 | C2 |')).toBeTruthy()
  expect(md.includes('| A3 | B3 | C3 |')).toBeTruthy()
  // First row should be header, no empty <br /> headers
  expect(md.includes('<br />')).toBeFalsy()
})

test('paste google docs table promotes first row even when nested in wrapper', async ({
  page,
}) => {
  // Google Docs wraps tables in <b><div>...<table>...</table>...</div></b>
  // This tests that the paste rule traverses into wrapper nodes
  await focusEditor(page)
  await paste(page, {
    'text/html': googleDocsTableWithoutHeader,
  })
  await waitNextFrame(page)
  const md = await getMarkdown(page)
  // The table from googleDocsTableWithoutHeader is nested inside <b><div>
  // The paste rule should still find and fix it
  expect(md.includes('| 111 | 222 | 333 |')).toBeTruthy()
  expect(md.includes('| 444 | 555 | 666 |')).toBeTruthy()
  expect(md.includes('| 777 | aaa | bbb |')).toBeTruthy()
  // First row should be promoted to header, no empty <br /> headers
  expect(md.includes('<br />')).toBeFalsy()
})

const googleDocsSingleRowTable = `
<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-single"><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;table-layout:fixed;width:468pt"><colgroup><col /><col /></colgroup><tbody><tr style="height:0pt"><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>Only1</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr"><span>Only2</span></p></td></tr></tbody></table></div></b>
`.trim()

test('paste single row google docs table keeps empty header', async ({
  page,
}) => {
  await focusEditor(page)
  await paste(page, {
    'text/html': googleDocsSingleRowTable,
  })
  await waitNextFrame(page)
  const md = await getMarkdown(page)
  // Single row can't be promoted (would leave 0 data rows), so empty header is kept
  expect(md.includes('<br />')).toBeTruthy()
  expect(md.includes('Only1')).toBeTruthy()
  expect(md.includes('Only2')).toBeTruthy()
})
