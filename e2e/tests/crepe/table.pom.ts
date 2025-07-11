import type { Page } from '@playwright/test'

import { focusEditor } from 'tests/misc'

export class TablePageObjectModel {
  constructor(private readonly page: Page) {}

  editor() {
    return this.page.locator('.editor')
  }

  tableBlocks() {
    return this.editor().locator('.milkdown-table-block')
  }

  tableBlock(index = 0) {
    return this.tableBlocks().nth(index)
  }

  editorTable(index = 0) {
    return this.tableBlock(index).locator('table.children')
  }

  colPicker(index = 0) {
    return this.tableBlock(index).locator('[data-role="col-drag-handle"]')
  }

  rowPicker(index = 0) {
    return this.tableBlock(index).locator('[data-role="row-drag-handle"]')
  }

  colButtonGroup(index = 0) {
    return this.colPicker(index).locator('.button-group')
  }

  rowButtonGroup(index = 0) {
    return this.rowPicker(index).locator('.button-group')
  }

  rows(index = 0) {
    return this.editorTable(index).locator('tr')
  }

  row(index: number, tableIndex = 0) {
    return this.rows(tableIndex).nth(index)
  }

  cells(tableIndex = 0) {
    return this.editorTable(tableIndex).locator('th, td')
  }

  cellsInRow(rowIndex: number, tableIndex = 0) {
    return this.row(rowIndex, tableIndex).locator('th, td')
  }

  cell(rowIndex: number, cellIndex: number, tableIndex = 0) {
    return this.cellsInRow(rowIndex, tableIndex).nth(cellIndex)
  }

  previewTable(index = 0) {
    return this.tableBlock(index).locator('div.drag-preview')
  }

  previewRows(index = 0) {
    return this.previewTable(index).locator('tr')
  }

  previewRow(index: number, tableIndex = 0) {
    return this.previewRows(tableIndex).nth(index)
  }

  previewCells(tableIndex = 0) {
    return this.previewTable(tableIndex).locator('th, td')
  }

  previewCellsInRow(rowIndex: number, tableIndex = 0) {
    return this.previewRow(rowIndex, tableIndex).locator('th, td')
  }

  previewCell(rowIndex: number, cellIndex: number, tableIndex = 0) {
    return this.previewCellsInRow(rowIndex, tableIndex).nth(cellIndex)
  }

  addTable = async (index = 0) => {
    await focusEditor(this.page)
    await this.page.keyboard.type('/table')
    const tableListItem = this.page.locator('li', {
      hasText: 'Table',
    })
    await tableListItem.waitFor({ state: 'visible' })
    await this.page.keyboard.press('Enter')
    await this.tableBlock(index).waitFor({ state: 'visible' })
  }
}
