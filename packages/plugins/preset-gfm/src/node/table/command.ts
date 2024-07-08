import { paragraphSchema } from '@milkdown/preset-commonmark'
import { Selection } from '@milkdown/prose/state'
import { CellSelection, addColumnAfter, addColumnBefore, deleteColumn, deleteRow, deleteTable, goToNextCell, isInTable, selectedRect, setCellAttr } from '@milkdown/prose/tables'
import { $command } from '@milkdown/utils'
import { findParentNodeType } from '@milkdown/prose'
import { withMeta } from '../../__internal__'
import { addRowWithAlignment, createTable, moveCol, moveRow, selectCol, selectRow, selectTable } from './utils'
import { tableSchema } from './schema'

/// A command for moving cursor to previous cell.
export const goToPrevTableCellCommand = $command('GoToPrevTableCell', () => () => goToNextCell(-1))

withMeta(goToPrevTableCellCommand, {
  displayName: 'Command<goToPrevTableCellCommand>',
  group: 'Table',
})

/// A command for moving cursor to next cell.
export const goToNextTableCellCommand = $command('GoToNextTableCell', () => () => goToNextCell(1))

withMeta(goToNextTableCellCommand, {
  displayName: 'Command<goToNextTableCellCommand>',
  group: 'Table',
})

/// A command for quitting current table and insert a new paragraph node.
export const exitTable = $command('ExitTable', ctx => () => (state, dispatch) => {
  if (!isInTable(state))
    return false

  const { $head } = state.selection
  const table = findParentNodeType($head, tableSchema.type(ctx))
  if (!table)
    return false

  const { to } = table

  const tr = state.tr
    .replaceWith(to, to, paragraphSchema.type(ctx).createAndFill()!)

  tr.setSelection(Selection.near(tr.doc.resolve(to), 1)).scrollIntoView()
  dispatch?.(tr)
  return true
})

withMeta(exitTable, {
  displayName: 'Command<breakTableCommand>',
  group: 'Table',
})

/// A command for inserting a table.
/// You can specify the number of rows and columns.
/// By default, it will insert a 3x3 table.
export const insertTableCommand = $command('InsertTable', ctx => ({ row, col }: { row?: number, col?: number } = {}) => (state, dispatch) => {
  const { selection, tr } = state
  const { from } = selection
  const table = createTable(ctx, row, col)
  const _tr = tr.replaceSelectionWith(table)
  const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true)
  if (sel)
    _tr.setSelection(sel)

  dispatch?.(_tr)

  return true
})

withMeta(insertTableCommand, {
  displayName: 'Command<insertTableCommand>',
  group: 'Table',
})

/// A command for moving a row in a table.
/// You should specify the `from` and `to` index.
export const moveRowCommand = $command('MoveRow', () =>
  ({ from, to, pos }: { from?: number, to?: number, pos?: number } = {}) =>
    (state, dispatch) => {
      const { tr } = state
      const result = dispatch?.(moveRow({ tr, origin: from ?? 0, target: to ?? 0, pos, select: true }))

      return Boolean(result)
    })

withMeta(moveRowCommand, {
  displayName: 'Command<moveRowCommand>',
  group: 'Table',
})

/// A command for moving a column in a table.
/// You should specify the `from` and `to` index.
export const moveColCommand = $command('MoveCol', () =>
  ({ from, to, pos }: { from?: number, to?: number, pos?: number } = {}) =>
    (state, dispatch) => {
      const { tr } = state
      const result = dispatch?.(moveCol({ tr, origin: from ?? 0, target: to ?? 0, pos, select: true }))

      return Boolean(result)
    })

withMeta(moveColCommand, {
  displayName: 'Command<moveColCommand>',
  group: 'Table',
})

/// A command for selecting a row.
export const selectRowCommand = $command<{ index: number, pos?: number }, 'SelectRow'>('SelectRow', () =>
  (payload: { index: number, pos?: number } = { index: 0 }) => (state, dispatch) => {
    const { tr } = state
    const result = dispatch?.(selectRow(payload.index, payload.pos)(tr))

    return Boolean(result)
  })

withMeta(selectRowCommand, {
  displayName: 'Command<selectRowCommand>',
  group: 'Table',
})

/// A command for selecting a column.
export const selectColCommand = $command<{ index: number, pos?: number }, 'SelectCol'>('SelectCol', () =>
  (payload: { index: number, pos?: number } = { index: 0 }) => (state, dispatch) => {
    const { tr } = state
    const result = dispatch?.(selectCol(payload.index, payload.pos)(tr))

    return Boolean(result)
  })

withMeta(selectColCommand, {
  displayName: 'Command<selectColCommand>',
  group: 'Table',
})

/// A command for selecting a table.
export const selectTableCommand = $command('SelectTable', () => () => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(selectTable(tr))

  return Boolean(result)
})

withMeta(selectTableCommand, {
  displayName: 'Command<selectTableCommand>',
  group: 'Table',
})

/// A command for deleting selected cells.
/// If the selection is a row or column, the row or column will be deleted.
/// If all cells are selected, the table will be deleted.
export const deleteSelectedCellsCommand = $command('DeleteSelectedCells', () => () => (state, dispatch) => {
  const { selection } = state
  if (!(selection instanceof CellSelection))
    return false

  const isRow = selection.isRowSelection()
  const isCol = selection.isColSelection()

  if (isRow && isCol)
    return deleteTable(state, dispatch)

  if (isCol)
    return deleteColumn(state, dispatch)

  else
    return deleteRow(state, dispatch)
})

withMeta(deleteSelectedCellsCommand, {
  displayName: 'Command<deleteSelectedCellsCommand>',
  group: 'Table',
})

/// A command for adding a column before the current column.
export const addColBeforeCommand = $command('AddColBefore', () => () => addColumnBefore)

withMeta(addColBeforeCommand, {
  displayName: 'Command<addColBeforeCommand>',
  group: 'Table',
})

/// A command for adding a column after the current column.
export const addColAfterCommand = $command('AddColAfter', () => () => addColumnAfter)

withMeta(addColAfterCommand, {
  displayName: 'Command<addColAfterCommand>',
  group: 'Table',
})

/// A command for adding a row before the current row.
export const addRowBeforeCommand = $command('AddRowBefore', ctx => () => (state, dispatch) => {
  if (!isInTable(state))
    return false
  if (dispatch) {
    const rect = selectedRect(state)
    dispatch(addRowWithAlignment(ctx, state.tr, rect, rect.top))
  }
  return true
})

withMeta(addRowBeforeCommand, {
  displayName: 'Command<addRowBeforeCommand>',
  group: 'Table',
})

/// A command for adding a row after the current row.
export const addRowAfterCommand = $command('AddRowAfter', ctx => () => (state, dispatch) => {
  if (!isInTable(state))
    return false
  if (dispatch) {
    const rect = selectedRect(state)
    dispatch(addRowWithAlignment(ctx, state.tr, rect, rect.bottom))
  }
  return true
})

withMeta(addRowAfterCommand, {
  displayName: 'Command<addRowAfterCommand>',
  group: 'Table',
})

/// A command for setting alignment property for selected cells.
/// You can specify the alignment as `left`, `center`, or `right`.
/// It's `left` by default.
export const setAlignCommand = $command<'left' | 'center' | 'right', 'SetAlign'>('SetAlign', () => (alignment = 'left') => setCellAttr('alignment', alignment))

withMeta(setAlignCommand, {
  displayName: 'Command<setAlignCommand>',
  group: 'Table',
})
