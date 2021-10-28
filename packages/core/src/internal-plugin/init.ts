/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { remark } from 'remark';

import type { Editor } from '../editor';
import { RemarkParser } from '../utility';
import { ConfigReady } from './config';
import { prosePluginsCtx } from './prose-plugin-factory';
import { remarkPluginsCtx } from './remark-plugin-factory';

export const InitReady = createTimer('InitReady');

export const initTimerCtx = createSlice<Timer[]>([], 'initTimer');
export const editorCtx = createSlice<Editor>({} as Editor, 'editor');

export const remarkCtx = createSlice(remark(), 'remark');

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(remarkCtx, remark())
            .inject(initTimerCtx, [ConfigReady])
            .record(InitReady);

        return async (ctx) => {
            await ctx.waitTimers(initTimerCtx);

            const remark = ctx.get(remarkCtx);
            const remarkPlugins = ctx.get(remarkPluginsCtx);

            const processor = remarkPlugins.reduce((acc: RemarkParser, plug) => acc.use(plug), remark);

            ctx.set(remarkCtx, processor);
            ctx.done(InitReady);
        };
    };
