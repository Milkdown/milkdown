/* Copyright 2021, Milkdown by Mirone. */
import type { MarkdownNode } from '@milkdown/transformer'
import { commandsCtx } from '@milkdown/core'
import { paragraphSchema } from '@milkdown/preset-commonmark'
import { InputRule } from '@milkdown/prose/inputrules'
import type { NodeType } from '@milkdown/prose/model'
import { Selection, TextSelection } from '@milkdown/prose/state'
import { CellSelection, addColumnAfter, addColumnBefore, deleteColumn, deleteRow, deleteTable, goToNextCell, isInTable, selectedRect, setCellAttr, tableNodes } from '@milkdown/prose/tables'
import { $command, $inputRule, $nodeSchema, $useKeymap } from '@milkdown/utils'
import { withMeta } from '../../__internal__'
import { addRowWithAlignment, createTable, moveCol, moveRow, selectCol, selectRow, selectTable } from './utils'

const originalSchema = tableNodes({
  tableGroup: 'block',
  cellContent: 'paragraph',
  cellAttributes: {
    alignment: {
      default: 'left',
      getFromDOM: dom => (dom as HTMLElement).style.textAlign || 'left',
      setDOMAttr: (value, attrs) => {
        attrs.style = `text-align: ${value || 'left'}`
      },
    },
  },
})

/// Schema for table node.
export const tableSchema = $nodeSchema('table', () => ({
  ...originalSchema.table,
  parseMarkdown: {
    match: node => node.type === 'table',
    runner: (state, node, type) => {
      const align = node.align as (string | null)[]
      const children = (node.children as MarkdownNode[]).map((x, i) => ({
        ...x,
        align,
        isHeader: i === 0,
      }))
      state.openNode(type)
      state.next(children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table',
    runner: (state, node) => {
      const firstLine = node.content.firstChild?.content
      if (!firstLine)
        return

      const align: (string | null)[] = []
      firstLine.forEach((cell) => {
        align.push(cell.attrs.alignment)
      })
      state.openNode('table', undefined, { align })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableSchema.node, {
  displayName: 'NodeSchema<table>',
  group: 'Table',
})

withMeta(tableSchema.ctx, {
  displayName: 'NodeSchemaCtx<table>',
  group: 'Table',
})

/// Schema for table row node.
export const tableRowSchema = $nodeSchema('table_row', () => ({
  ...originalSchema.table_row,
  parseMarkdown: {
    match: node => node.type === 'tableRow',
    runner: (state, node, type) => {
      const align = node.align as (string | null)[]
      const children = (node.children as MarkdownNode[]).map((x, i) => ({
        ...x,
        align: align[i],
        isHeader: node.isHeader,
      }))
      state.openNode(type)
      state.next(children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_row',
    runner: (state, node) => {
      state.openNode('tableRow')
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableRowSchema.node, {
  displayName: 'NodeSchema<tableRow>',
  group: 'Table',
})

withMeta(tableRowSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableRow>',
  group: 'Table',
})

/// Schema for table cell node.
export const tableCellSchema = $nodeSchema('table_cell', () => ({
  ...originalSchema.table_cell,
  parseMarkdown: {
    match: node => node.type === 'tableCell' && !node.isHeader,
    runner: (state, node, type) => {
      const align = node.align as string
      state
        .openNode(type, { alignment: align })
        .openNode(state.schema.nodes.paragraph as NodeType)
        .next(node.children)
        .closeNode()
        .closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_cell',
    runner: (state, node) => {
      state.openNode('tableCell').next(node.content).closeNode()
    },
  },
}))

withMeta(tableCellSchema.node, {
  displayName: 'NodeSchema<tableCell>',
  group: 'Table',
})

withMeta(tableCellSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableCell>',
  group: 'Table',
})

/// Schema for table header node.
export const tableHeaderSchema = $nodeSchema('table_header', () => ({
  ...originalSchema.table_header,
  parseMarkdown: {
    match: node => node.type === 'tableCell' && !!node.isHeader,
    runner: (state, node, type) => {
      const align = node.align as string
      state.openNode(type, { alignment: align })
      state.openNode(state.schema.nodes.paragraph as NodeType)
      state.next(node.children)
      state.closeNode()
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'table_header',
    runner: (state, node) => {
      state.openNode('tableCell')
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(tableHeaderSchema.node, {
  displayName: 'NodeSchema<tableHeader>',
  group: 'Table',
})

withMeta(tableHeaderSchema.ctx, {
  displayName: 'NodeSchemaCtx<tableHeader>',
  group: 'Table',
})

/// A input rule for creating table.
/// For example, `|2x2|` will create a 2x2 table.
export const insertTableInputRule = $inputRule(ctx => new InputRule(
  /^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/, (state, match, start, end) => {
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), tableSchema.type(ctx)))
      return null

    const tableNode = createTable(
      ctx,
      Number(match.groups?.row),
      Number(match.groups?.col),
    )
    const tr = state.tr.replaceRangeWith(start, end, tableNode)
    return tr.setSelection(TextSelection.create(tr.doc, start + 3)).scrollIntoView()
  },
))

withMeta(insertTableInputRule, {
  displayName: 'InputRule<insertTableInputRule>',
  group: 'Table',
})

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

/// A command for splitting current table into two tables.
/// If the selection is at the end of the table,
/// it will just quit the table and insert a new paragraph node.
export const breakTableCommand = $command('BreakTable', ctx => () => (state, dispatch) => {
  if (!isInTable(state))
    return false

  const { $head } = state.selection
  const pos = $head.after()
  const tr = state.tr
    .replaceWith(pos, pos, paragraphSchema.type(ctx).createAndFill()!)

  tr.setSelection(Selection.near(tr.doc.resolve(pos), 1)).scrollIntoView()
  dispatch?.(tr)
  return true
})

withMeta(breakTableCommand, {
  displayName: 'Command<breakTableCommand>',
  group: 'Table',
})

/// A command for inserting a table.
/// You can specify the number of rows and columns.
/// By default, it will insert a 3x3 table.
export const insertTableCommand = $command('InsertTable', ctx => ({ row, col }: { row?: number; col?: number } = {}) => (state, dispatch) => {
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
export const moveRowCommand = $command('MoveRow', () => ({ from, to }: { from?: number; to?: number } = {}) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(moveRow(tr, from ?? 0, to ?? 0, true))

  return Boolean(result)
})

withMeta(moveRowCommand, {
  displayName: 'Command<moveRowCommand>',
  group: 'Table',
})

/// A command for moving a column in a table.
/// You should specify the `from` and `to` index.
export const moveColCommand = $command('MoveCol', () => ({ from, to }: { from?: number; to?: number } = {}) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(moveCol(tr, from ?? 0, to ?? 0, true))

  return Boolean(result)
})

withMeta(moveColCommand, {
  displayName: 'Command<moveColCommand>',
  group: 'Table',
})

/// A command for selecting a row.
export const selectRowCommand = $command<number, 'SelectRow'>('SelectRow', () => (index = 0) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(selectRow(index)(tr))

  return Boolean(result)
})

withMeta(selectRowCommand, {
  displayName: 'Command<selectRowCommand>',
  group: 'Table',
})

/// A command for selecting a column.
export const selectColCommand = $command<number, 'SelectCol'>('SelectCol', () => (index = 0) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(selectCol(index)(tr))

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

/// Keymap for table commands.
/// - `<Mod-]>`/`<Tab>`: Move to the next cell.
/// - `<Mod-[>`/`<Shift-Tab>`: Move to the previous cell.
/// - `<Mod-Enter>`: Exit the table, and break it if possible.
export const tableKeymap = $useKeymap('tableKeymap', {
  NextCell: {
    shortcuts: ['Mod-]', 'Tab'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)

      return () => commands.call(goToNextTableCellCommand.key)
    },
  },
  PrevCell: {
    shortcuts: ['Mod-[', 'Shift-Tab'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)

      return () => commands.call(goToPrevTableCellCommand.key)
    },
  },
  ExitTable: {
    shortcuts: ['Mod-Enter'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)

      return () => commands.call(breakTableCommand.key)
    },
  },
})

withMeta(tableKeymap.ctx, {
  displayName: 'KeymapCtx<table>',
  group: 'Table',
})

withMeta(tableKeymap.shortcuts, {
  displayName: 'Keymap<table>',
  group: 'Table',
})

export * from './utils'
