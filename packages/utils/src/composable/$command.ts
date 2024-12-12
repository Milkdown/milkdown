import type { Cmd, CmdKey } from '@milkdown/core'
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import {
  CommandsReady,
  commandsCtx,
  commandsTimerCtx,
  createCmdKey,
} from '@milkdown/core'

import { addTimer } from './utils'

/// @internal
export type $Command<T> = MilkdownPlugin & {
  run: (payload?: T) => boolean
  key: CmdKey<T>
}

/// Create a command plugin. The command will be registered in the `commandsCtx` and can be called by other parts of the editor.
/// It takes a key and a factory function. The factory function will be called when the plugin is created.
/// The factory should return a function that will be called when the command is executed.
/// The function should receive at **most one parameter**, which is the payload of the command.
/// And the payload should always be **optional**.
///
/// ```ts
/// import { setBlockType } from '@milkdown/prose/commands'
///
/// const commandPlugin = $command('SetAsHeading', (ctx) => {
///   return (level = 1) => setBlockType(headingSchema.type(), { level });
/// });
/// ```
///
/// Additional property:
/// - `key`: The key of the command.
/// - `run`: The function to run the command.
///
/// You can use `callCommand` in `editor.action` to call the command.
///
/// ```ts
/// import { callCommand } from '@milkdown/utils';
/// const editor = Editor.make().use(/* some plugins */).use(commandPlugin).create();
///
/// editor.action(callCommand(commandPlugin.key, 3));
/// ```
export function $command<T, K extends string>(
  key: K,
  cmd: (ctx: Ctx) => Cmd<T>
): $Command<T> {
  const cmdKey = createCmdKey<T>(key)

  const plugin: MilkdownPlugin = (ctx) => async () => {
    ;(<$Command<T>>plugin).key = cmdKey
    await ctx.wait(CommandsReady)
    const command = cmd(ctx)
    ctx.get(commandsCtx).create(cmdKey, command)
    ;(<$Command<T>>plugin).run = (payload?: T) =>
      ctx.get(commandsCtx).call(key, payload)

    return () => {
      ctx.get(commandsCtx).remove(cmdKey)
    }
  }

  return <$Command<T>>plugin
}

/// The async version for `$command`. You can use `await` in the factory when creating the command.
/// ```ts
/// const commandPlugin = $commandASync('LoadRemoteDoc', (ctx) => {
///   return async (url = 'my-remote-api') => {
///     const doc = await LoadRemoteDoc(url);
///     return addDoc(doc);
///   }
/// });
/// ```
///
/// Additional property:
/// - `key`: The key of the command.
/// - `run`: The function to run the command.
/// - `timer`: The timer which will be resolved when the command is ready.
export function $commandAsync<T, K extends string>(
  key: K,
  cmd: (ctx: Ctx) => Promise<Cmd<T>>,
  timerName?: string
) {
  const cmdKey = createCmdKey<T>(key)
  return addTimer<$Command<T>>(
    async (ctx, plugin) => {
      await ctx.wait(CommandsReady)
      const command = await cmd(ctx)
      ctx.get(commandsCtx).create(cmdKey, command)
      ;(<$Command<T>>plugin).run = (payload?: T) =>
        ctx.get(commandsCtx).call(key, payload)
      ;(<$Command<T>>plugin).key = cmdKey
      return () => {
        ctx.get(commandsCtx).remove(cmdKey)
      }
    },
    commandsTimerCtx,
    timerName
  )
}
