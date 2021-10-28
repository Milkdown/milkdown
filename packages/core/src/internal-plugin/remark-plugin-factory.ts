/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

export type RemarkPlugin = Plugin<unknown[], Root>;

export const remarkPluginsCtx = createSlice<RemarkPlugin[]>([], 'remarkPlugins');

export const remarkPluginFactory =
    (plugin: RemarkPlugin | RemarkPlugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
