import type { Page } from '@playwright/test'

import { focusEditor } from 'tests/misc'

export class TablePageObjectModel {
  constructor(
    private readonly page: Page,
    private readonly index: number = 0
  ) {}

  editor() {
    return this.page.locator('.editor')
  }

  tableBlocks() {
    return this.editor().locator('.milkdown-table-block')
  }

  tableBlock() {
    return this.tableBlocks().nth(this.index)
  }

  editorTable() {
    return this.tableBlock().locator('table.children')
  }

  colPicker() {
    return this.tableBlock().locator('[data-role="col-drag-handle"]')
  }

  rowPicker() {
    return this.tableBlock().locator('[data-role="row-drag-handle"]')
  }

  colButtonGroup() {
    return this.colPicker().locator('.button-group')
  }

  rowButtonGroup() {
    return this.rowPicker().locator('.button-group')
  }

  rows() {
    return this.editorTable().locator('tr')
  }

  row(index: number) {
    return this.rows().nth(index)
  }

  cells() {
    return this.editorTable().locator('th, td')
  }

  cellsInRow(rowIndex: number) {
    return this.row(rowIndex).locator('th, td')
  }

  cell(rowIndex: number, cellIndex: number) {
    return this.cellsInRow(rowIndex).nth(cellIndex)
  }

  previewTable() {
    return this.tableBlock().locator('div.drag-preview')
  }

  previewRows() {
    return this.previewTable().locator('tr')
  }

  previewRow(index: number) {
    return this.previewRows().nth(index)
  }

  previewCells() {
    return this.previewTable().locator('th, td')
  }

  previewCellsInRow(rowIndex: number) {
    return this.previewRow(rowIndex).locator('th, td')
  }

  previewCell(rowIndex: number, cellIndex: number) {
    return this.previewCellsInRow(rowIndex).nth(cellIndex)
  }

  addTable = async () => {
    await focusEditor(this.page)
    await this.page.keyboard.type('/table')
    const tableListItem = this.page.locator('li', {
      hasText: 'Table',
    })
    await tableListItem.waitFor({ state: 'visible' })
    await this.page.keyboard.press('Enter')
    await this.tableBlock().waitFor({ state: 'visible' })
  }
}
