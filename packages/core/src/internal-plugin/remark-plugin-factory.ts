/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';

import { RemarkPlugin } from '../utility';

export const remarkPluginsCtx = createSlice<RemarkPlugin[]>([], 'remarkPlugins');

export const remarkPluginFactory =
    (plugin: RemarkPlugin | RemarkPlugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
