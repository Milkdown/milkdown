import { CommandManager, commandsCtx, CommandsReady, createCtx, MilkdownPlugin, prosePluginsCtx } from '@milkdown/core';
import { config } from './config';
import { WrappedAction } from './item';
import { slashPlugin } from './slash-plugin';

export { createDropdownItem, nodeExists } from './utility';

export type SlashConfig = (command: CommandManager['get']) => WrappedAction[];

export const slashCtx = createCtx<SlashConfig>(() => []);

export const slash: MilkdownPlugin = (pre) => {
    pre.inject(slashCtx, config);

    return async (ctx) => {
        await ctx.wait(CommandsReady);
        const commands = ctx.get(commandsCtx).get;
        const config = ctx.get(slashCtx);
        ctx.update(prosePluginsCtx, (prev) => prev.concat([slashPlugin(config(commands))].flat()));
    };
};
