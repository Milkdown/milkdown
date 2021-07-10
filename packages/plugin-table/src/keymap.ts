import { createProsemirrorPlugin, LoadPluginContext } from '@milkdown/core';
import { Command, Keymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { exitTable } from './command';
import { tableOperatorPlugin } from './table-operator-plugin';

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

export type KeymapPluginOptions = { keymap?: KeyMap };

export const keymapPlugin = (options: KeymapPluginOptions = {}) =>
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
        return [columnResizing({}), tableOperatorPlugin(), keymap(keymapValue), tableEditing()];
    });
