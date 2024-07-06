import { commandsCtx } from '@milkdown/core'
import { InputRule } from '@milkdown/prose/inputrules'
import { TextSelection } from '@milkdown/prose/state'
import { $inputRule, $useKeymap } from '@milkdown/utils'
import { withMeta } from '../../__internal__'
import { createTable } from './utils'
import { tableSchema } from './schema'
import { exitTable, goToNextTableCellCommand, goToPrevTableCellCommand } from './command'

/// A input rule for creating table.
/// For example, `|2x2|` will create a 2x2 table.
export const insertTableInputRule = $inputRule(ctx => new InputRule(
  /^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/,
  (state, match, start, end) => {
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
