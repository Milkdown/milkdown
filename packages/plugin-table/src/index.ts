/* Copyright 2021, Milkdown by Mirone. */
import { prosePluginFactory, remarkPluginFactory } from '@milkdown/core';
import { AtomList } from '@milkdown/utils';
import { columnResizing, tableEditing } from 'prosemirror-tables';
import gfm from 'remark-gfm';

import { BreakTable, InsertTable, NextCell, PrevCell, tableNodes } from './nodes';
import { operatorPlugin } from './operator-plugin';

export const remarkGFMPlugin = remarkPluginFactory(gfm);
export const tableEditPlugin = prosePluginFactory(() => [columnResizing({}), tableEditing()]);

export const tablePlugins = AtomList.create([remarkGFMPlugin, tableEditPlugin, operatorPlugin()]);
export const table = AtomList.create([...tablePlugins, ...tableNodes]);

export { BreakTable, InsertTable, NextCell, PrevCell, SupportedKeys, tableNodes } from './nodes';
export { createTable } from './utils';

export const commands = {
    NextCell,
    PrevCell,
    BreakTable,
    InsertTable,
} as const;
export type Commands = typeof commands;
