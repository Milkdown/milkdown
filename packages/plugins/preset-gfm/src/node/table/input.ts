import { commandsCtx } from '@milkdown/core'
import { paragraphSchema } from '@milkdown/preset-commonmark'
import { InputRule } from '@milkdown/prose/inputrules'
import { type Fragment as FragmentType, Fragment, type Node as ProsemirrorNode, Slice } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { $inputRule, $pasteRule, $useKeymap } from '@milkdown/utils'

import { withMeta } from '../../__internal__'
import {
  exitTable,
  goToNextTableCellCommand,
  goToPrevTableCellCommand,
} from './command'
import { tableHeaderSchema, tableSchema } from './schema'
import { createTable } from './utils'

/// A input rule for creating table.
/// For example, `|2x2|` will create a 2x2 table.
export const insertTableInputRule = $inputRule(
  (ctx) =>
    new InputRule(
      /^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/,
      (state, match, start, end) => {
        const $start = state.doc.resolve(start)
        if (
          !$start
            .node(-1)
            .canReplaceWith(
              $start.index(-1),
              $start.indexAfter(-1),
              tableSchema.type(ctx)
            )
        )
          return null

        const row = Math.max(Number(match.groups?.row ?? 0), 2)

        const tableNode = createTable(ctx, row, Number(match.groups?.col))
        const tr = state.tr.replaceRangeWith(start, end, tableNode)
        return tr
          .setSelection(TextSelection.create(tr.doc, start + 3))
          .scrollIntoView()
      }
    )
)

withMeta(insertTableInputRule, {
  displayName: 'InputRule<insertTableInputRule>',
  group: 'Table',
})

/// A paste rule for fixing tables without header cells.
/// This is a workaround for some editors (e.g. Google Docs) which allow creating tables without header cells,
/// which is not supported by Markdown schema.
/// This paste rule will promote the first data row to header, or add empty header cells as a fallback.
export const tablePasteRule = $pasteRule((ctx) => ({
  run: (slice, _view, isPlainText) => {
    if (isPlainText) {
      return slice
    }

    function fixTable(node: ProsemirrorNode): ProsemirrorNode {
      const rowsCount = node.childCount
      const colsCount = node.lastChild?.childCount ?? 0
      if (rowsCount === 0 || colsCount === 0) {
        return paragraphSchema.type(ctx).create()
      }

      const headerRow = node.firstChild
      const needToFixHeaderRow =
        colsCount > 0 && headerRow && headerRow.childCount === 0
      if (!needToFixHeaderRow) {
        return node
      }

      // If there are 2+ data rows (3+ total: empty header + 2+ data rows),
      // promote the first data row to header
      if (rowsCount >= 3) {
        const firstDataRow = node.child(1)
        const headerCells: ProsemirrorNode[] = []
        for (let i = 0; i < firstDataRow.childCount; i++) {
          const cell = firstDataRow.child(i)
          headerCells.push(
            tableHeaderSchema.type(ctx).create(cell.attrs, cell.content, cell.marks)
          )
        }
        const newHeaderRow = headerRow.type.create(headerRow.attrs, headerCells)

        // Collect remaining data rows (skip promoted row at index 1)
        const remainingRows: ProsemirrorNode[] = []
        for (let i = 2; i < rowsCount; i++) {
          remainingRows.push(node.child(i))
        }

        return node.type.create(node.attrs, [newHeaderRow, ...remainingRows])
      }

      // Fallback: only 1 data row, can't promote (would leave 0 data rows).
      // Fill the empty header with blank cells.
      const headerCells = Array(colsCount)
        .fill(0)
        .map(() => tableHeaderSchema.type(ctx).createAndFill()!)

      const tableCells = new Slice(Fragment.from(headerCells), 0, 0)

      const newHeaderRow = headerRow.replace(0, 0, tableCells)
      const newTable = node.replace(
        0,
        headerRow.nodeSize,
        new Slice(Fragment.from(newHeaderRow), 0, 0)
      )
      return newTable
    }

    function fixFragment(fragment: FragmentType): FragmentType {
      let result = fragment
      fragment.forEach((node, _offset, index) => {
        if (node.type === tableSchema.type(ctx)) {
          result = result.replaceChild(index, fixTable(node))
        } else if (node.childCount > 0) {
          const fixedContent = fixFragment(node.content)
          if (fixedContent !== node.content) {
            result = result.replaceChild(index, node.copy(fixedContent))
          }
        }
      })
      return result
    }

    const fragment = fixFragment(slice.content)
    return new Slice(Fragment.from(fragment), slice.openStart, slice.openEnd)
  },
}))

withMeta(tablePasteRule, {
  displayName: 'PasteRule<table>',
  group: 'Table',
})

/// Keymap for table commands.
/// - `<Mod-]>`/`<Tab>`: Move to the next cell.
/// - `<Mod-[>`/`<Shift-Tab>`: Move to the previous cell.
/// - `<Mod-Enter>`: Exit the table, and break it if possible.
export const tableKeymap = $useKeymap('tableKeymap', {
  NextCell: {
    priority: 100,
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
    shortcuts: ['Mod-Enter', 'Enter'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)

      return () => commands.call(exitTable.key)
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
