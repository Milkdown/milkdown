/* Copyright 2021, Milkdown by Mirone. */
import type { Plugin } from 'unified';

import { createSlice } from '../context';
import type { MilkdownPlugin } from '../utility';

export const remarkPluginsCtx = createSlice<Plugin<never, never>[]>([], 'remarkPlugins');

export const remarkPluginFactory =
    (plugin: Plugin | Plugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
