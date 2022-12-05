/* Copyright 2021, Milkdown by Mirone. */
import type { MarkdownNode } from '@milkdown/core'
import { commandsCtx } from '@milkdown/core'
import { paragraphSchema } from '@milkdown/preset-commonmark'
import { InputRule } from '@milkdown/prose/inputrules'
import type { NodeType } from '@milkdown/prose/model'
import { Selection, TextSelection } from '@milkdown/prose/state'
import { CellSelection, addColumnAfter, addColumnBefore, deleteColumn, deleteRow, deleteTable, goToNextCell, isInTable, selectedRect, setCellAttr, tableNodes } from '@milkdown/prose/tables'
import { $command, $inputRule, $nodeSchema, $useKeymap } from '@milkdown/utils'
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

export const insertTableInputRule = $inputRule(() => new InputRule(
  /^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/, (state, match, start, end) => {
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), tableSchema.type()))
      return null

    const tableNode = createTable(
      Number(match.groups?.row),
      Number(match.groups?.col),
    )
    const tr = state.tr.replaceRangeWith(start, end, tableNode).scrollIntoView()
    return tr.setSelection(TextSelection.create(tr.doc, start + 3))
  },
))

export const goToPrevTableCellCommand = $command('GoToPrevTableCell', () => () => goToNextCell(-1))

export const goToNextTableCellCommand = $command('GoToNextTableCell', () => () => goToNextCell(1))

export const breakTableCommand = $command('BreakTable', () => () => (state, dispatch) => {
  if (!isInTable(state))
    return false

  const { $head } = state.selection
  const pos = $head.after()
  const tr = state.tr
    .replaceWith(pos, pos, paragraphSchema.type().createAndFill()!)

  tr.setSelection(Selection.near(tr.doc.resolve(pos), 1)).scrollIntoView()
  dispatch?.(tr)
  return true
})

export const insertTableCommand = $command('InsertTable', () => ({ row, col }: { row?: number; col?: number } = {}) => (state, dispatch) => {
  const { selection, tr } = state
  const { from } = selection
  const table = createTable(row, col)
  const _tr = tr.replaceSelectionWith(table)
  const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true)
  if (sel)
    dispatch?.(_tr.setSelection(sel))

  return true
})

export const moveRowCommand = $command('MoveRow', () => ({ from, to }: { from?: number; to?: number } = {}) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(moveRow(tr, from ?? 0, to ?? 0, true))

  return Boolean(result)
})

export const moveColCommand = $command('MoveCol', () => ({ from, to }: { from?: number; to?: number } = {}) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(moveCol(tr, from ?? 0, to ?? 0, true))

  return Boolean(result)
})

export const selectRowCommand = $command<number, 'SelectRow'>('SelectRow', () => (index = 0) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(selectRow(index)(tr))

  return Boolean(result)
})

export const selectColCommand = $command<number, 'SelectCol'>('SelectCol', () => (index = 0) => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(selectCol(index)(tr))

  return Boolean(result)
})

export const selectTableCommand = $command('SelectTable', () => () => (state, dispatch) => {
  const { tr } = state
  const result = dispatch?.(selectTable(tr))

  return Boolean(result)
})

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

export const addColBeforeCommand = $command('AddColBefore', () => () => addColumnBefore)

export const addColAfterCommand = $command('AddColAfter', () => () => addColumnAfter)

export const addRowBeforeCommand = $command('AddRowBefore', () => () => (state, dispatch) => {
  if (!isInTable(state))
    return false
  if (dispatch) {
    const rect = selectedRect(state)
    dispatch(addRowWithAlignment(state.tr, rect, rect.top))
  }
  return true
})

export const addRowAfterCommand = $command('AddRowAfter', () => () => (state, dispatch) => {
  if (!isInTable(state))
    return false
  if (dispatch) {
    const rect = selectedRect(state)
    dispatch(addRowWithAlignment(state.tr, rect, rect.bottom))
  }
  return true
})

export const setAlignCommand = $command<'left' | 'center' | 'right', 'SetAlign'>('SetAlign', () => (alignment = 'left') => setCellAttr('alignment', alignment))

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

export * from './utils'
