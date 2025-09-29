import { commandsCtx } from '@milkdown/core'
import { paragraphSchema } from '@milkdown/preset-commonmark'
import { InputRule } from '@milkdown/prose/inputrules'
import { Fragment, Slice } from '@milkdown/prose/model'
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
/// This paste rule will add header cells to the first row if it's missing.
export const tablePasteRule = $pasteRule((ctx) => ({
  run: (slice, _view, isPlainText) => {
    if (isPlainText) {
      return slice
    }
    let fragment = slice.content

    slice.content.forEach((node, _offset, index) => {
      if (node?.type !== tableSchema.type(ctx)) {
        return
      }
      const rowsCount = node.childCount
      const colsCount = node.lastChild?.childCount ?? 0
      if (rowsCount === 0 || colsCount === 0) {
        fragment = fragment.replaceChild(
          index,
          paragraphSchema.type(ctx).create()
        )
        return
      }

      const headerRow = node.firstChild
      const needToFixHeaderRow =
        colsCount > 0 && headerRow && headerRow.childCount === 0
      if (!needToFixHeaderRow) {
        return
      }
      // Fix for tables with rows but no cells in the first row
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
      fragment = fragment.replaceChild(index, newTable)
    })

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
