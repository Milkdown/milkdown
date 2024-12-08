import type { Meta, MilkdownPlugin } from '@milkdown/ctx'
import { commandsCtx } from '@milkdown/core'
import {
  history as prosemirrorHistory,
  redo,
  undo,
} from '@milkdown/prose/history'
import { $command, $ctx, $prose, $useKeymap } from '@milkdown/utils'

function withMeta<T extends MilkdownPlugin>(
  plugin: T,
  meta: Partial<Meta> & Pick<Meta, 'displayName'>
): T {
  Object.assign(plugin, {
    meta: {
      package: '@milkdown/plugin-history',
      ...meta,
    },
  })

  return plugin
}

/// The milkdown command wrapper of [undo API](https://prosemirror.net/docs/ref/#history.undo) in [prosemirror-history](https://prosemirror.net/docs/ref/#history).
export const undoCommand = $command('Undo', () => () => undo)

withMeta(undoCommand, {
  displayName: 'Command<undo>',
})

/// The milkdown command wrapper of [redo API](https://prosemirror.net/docs/ref/#history.redo) in [prosemirror-history](https://prosemirror.net/docs/ref/#history).
export const redoCommand = $command('Redo', () => () => redo)

withMeta(redoCommand, {
  displayName: 'Command<redo>',
})

/// The [config](https://prosemirror.net/docs/ref/#history.history%5Econfig) of prosemirror history plugin.
export const historyProviderConfig = $ctx<
  { depth?: number; newGroupDelay?: number },
  'historyProviderConfig'
>({}, 'historyProviderConfig')

withMeta(historyProviderConfig, {
  displayName: 'Ctx<historyProviderConfig>',
})

/// The milkdown wrapper of [history API](https://prosemirror.net/docs/ref/#history.history) in [prosemirror-history](https://prosemirror.net/docs/ref/#history).
export const historyProviderPlugin = $prose((ctx) =>
  prosemirrorHistory(ctx.get(historyProviderConfig.key))
)

withMeta(historyProviderPlugin, {
  displayName: 'Ctx<historyProviderPlugin>',
})

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

withMeta(historyKeymap.ctx, {
  displayName: 'KeymapCtx<history>',
})
withMeta(historyKeymap.shortcuts, {
  displayName: 'Keymap<history>',
})

/// The milkdown history plugin.
export const history: MilkdownPlugin[] = [
  historyProviderConfig,
  historyProviderPlugin,
  historyKeymap,
  undoCommand,
  redoCommand,
].flat()
