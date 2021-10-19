/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';
import type { Plugin } from 'unified';

export const remarkPluginsCtx = createSlice<Plugin<never, never>[]>([], 'remarkPlugins');

export const remarkPluginFactory =
    (plugin: Plugin | Plugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
