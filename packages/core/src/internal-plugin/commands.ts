import type { Command } from 'prosemirror-commands';
import { createContainer, createCtx, Meta } from '../context';
import { createTimer, Timer } from '../timing';
import { Atom, MilkdownPlugin, getAtom } from '../utility';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export type CommandKey = Meta<Command>;

export type CommandManager = {
    create: (meta: CommandKey, value: Command) => void;
    get: (meta: CommandKey) => Command;
};

export const commandsCtx = createCtx<CommandManager>({} as CommandManager);
export const createCommand = (): CommandKey => createCtx<Command>((() => false) as Command);

export const commandsTimerCtx = createCtx<Timer[]>([]);
export const CommandsReady = createTimer('KeymapReady');
export const commands: MilkdownPlugin = (pre) => {
    const container = createContainer();
    const commandManager: CommandManager = {
        create: (meta, value) => meta(container.contextMap, value),
        get: (meta) => container.getCtx(meta).get(),
    };
    pre.inject(commandsCtx, commandManager).inject(commandsTimerCtx, [SchemaReady]).record(CommandsReady);
    return async (ctx) => {
        await ctx.waitTimers(commandsTimerCtx);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);

        const getCommands = <T extends Atom>(atoms: T[], isNode: boolean) =>
            atoms
                .map((x) => [getAtom(x.id, schema, isNode), x.commands] as const)
                .map(([atom, commands]) => atom && commands?.(atom, schema))
                .filter((x): x is [key: CommandKey, value: Command][] => !!x)
                .flat();

        const commands = [...getCommands(nodes, true), ...getCommands(marks, false)];
        const commandManager = ctx.get(commandsCtx);
        commands.forEach(([key, command]) => {
            commandManager.create(key, command);
        });
        ctx.done(CommandsReady);
    };
};
