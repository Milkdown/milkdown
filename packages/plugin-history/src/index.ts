/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { commandsCtx, createCmdKey } from '@milkdown/core'
import { history as prosemirrorHistory, redo, undo } from '@milkdown/prose/history'
import { $command, $ctx, $prose, $useKeymap } from '@milkdown/utils'

export const Undo = createCmdKey('Undo')
export const Redo = createCmdKey('Redo')

export const undoCommand = $command('Undo', () => () => undo)
export const redoCommand = $command('Undo', () => () => redo)

export const historyProviderConfig = $ctx<{ depth?: number; newGroupDelay?: number }, 'historyProviderConfig'>({}, 'historyProviderConfig')
export const historyProviderPlugin = $prose(ctx => prosemirrorHistory(ctx.get(historyProviderConfig.key)))

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

export const history: MilkdownPlugin[] = [historyProviderPlugin, historyKeymap, undoCommand, redoCommand].flat()
