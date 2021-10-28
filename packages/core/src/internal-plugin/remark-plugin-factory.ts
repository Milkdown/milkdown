/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';
import type { Plugin } from 'unified';

type RemarkPlugin = Plugin<any[], any, any>;

export const remarkPluginsCtx = createSlice<RemarkPlugin[]>([], 'remarkPlugins');

export const remarkPluginFactory =
    (plugin: RemarkPlugin | RemarkPlugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
