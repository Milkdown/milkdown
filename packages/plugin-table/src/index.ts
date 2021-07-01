import { createProsemirrorPlugin, createRemarkPlugin, LoadPluginContext } from '@milkdown/core';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import gfm from 'remark-gfm';
import { keymap } from 'prosemirror-keymap';
import { Keymap, Command } from 'prosemirror-commands';
import { nodes } from './nodes';
import { tableOperatorPlugin } from './table-operator-plugin';
import { exitTable } from './command';

export enum SupportedKeys {
    NextCell = 'NextCell',
    PrevCell = 'PrevCell',
    ExitTable = 'ExitTable',
}
export type KeyMap = Partial<Record<SupportedKeys, string>>;

const defaultKeymap: Required<KeyMap> = {
    [SupportedKeys.NextCell]: 'Mod-]',
    [SupportedKeys.PrevCell]: 'Mod-[',
    [SupportedKeys.ExitTable]: 'Mod-Enter',
};

const keymapCommands = (ctx: LoadPluginContext): Record<SupportedKeys, Command> => ({
    [SupportedKeys.NextCell]: goToNextCell(1),
    [SupportedKeys.PrevCell]: goToNextCell(-1),
    [SupportedKeys.ExitTable]: exitTable(ctx.schema.nodes.paragraph),
});

type PluginOptions = { keymap?: KeyMap };
const plugin = (options: PluginOptions = {}) =>
    createProsemirrorPlugin('milkdown-table', (ctx) => {
        const customKeyMap = {
            ...defaultKeymap,
            ...(options.keymap || {}),
        };
        const commands = keymapCommands(ctx);
        const keymapValue: Keymap = Object.entries(customKeyMap)
            .filter((x): x is [SupportedKeys, string] => !!x)
            .reduce((acc, [name, key]) => {
                return {
                    ...acc,
                    [key]: commands[name],
                };
            }, {} as Record<string, Command>);
        return [columnResizing({}), tableEditing(), tableOperatorPlugin(), keymap(keymapValue)];
    });

const remarkGFMPlugin = createRemarkPlugin('remark-table-markdown', () => [gfm]);

export const table = (options: PluginOptions = {}) => [...nodes, remarkGFMPlugin, plugin(options)];

export { createTable } from './utils';
