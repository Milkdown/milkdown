/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { commandsCtx, createCmdKey } from '@milkdown/core'
import { history as prosemirrorHistory, redo, undo } from '@milkdown/prose/history'
import { $command, $ctx, $prose, $useKeymap } from '@milkdown/utils'

/// The milkdown command key for `Undo` command.
export const Undo = createCmdKey('Undo')

/// The milkdown command key for `Redo` command.
export const Redo = createCmdKey('Redo')

/// The milkdown command wrapper of [undo API](https://prosemirror.net/docs/ref/#history.undo) in [prosemirror-history](https://prosemirror.net/docs/ref/#history).
export const undoCommand = $command('Undo', () => () => undo)

/// The milkdown command wrapper of [redo API](https://prosemirror.net/docs/ref/#history.redo) in [prosemirror-history](https://prosemirror.net/docs/ref/#history).
export const redoCommand = $command('Undo', () => () => redo)

/// The [config](https://prosemirror.net/docs/ref/#history.history%5Econfig) of prosemirror history plugin.
export const historyProviderConfig = $ctx<{ depth?: number; newGroupDelay?: number }, 'historyProviderConfig'>({}, 'historyProviderConfig')

/// The milkdown wrapper of [history API](https://prosemirror.net/docs/ref/#history.history) in [prosemirror-history](https://prosemirror.net/docs/ref/#history).
export const historyProviderPlugin = $prose(ctx => prosemirrorHistory(ctx.get(historyProviderConfig.key)))

/// The keymap of history plugin, it's `mod-z` for undo and `mod-y`/`shift-mod-z` for redo.
export const historyKeymap = $useKeymap('historyKeymap', {
  Undo: {
    shortcuts: 'Mod-z',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(undoCommand.key)
    },
  },
  Redo: {
    shortcuts: ['Mod-y', 'Shift-Mod-z'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(redoCommand.key)
    },
  },
})

/// The milkdown history plugin.
export const history: MilkdownPlugin[] = [historyProviderConfig, historyProviderPlugin, historyKeymap, undoCommand, redoCommand].flat()
