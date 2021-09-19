/* Copyright 2021, Milkdown by Mirone. */
import re, { RemarkOptions } from 'remark';
import type { Processor } from 'unified';

import { createSlice, Slice } from '../context';
import type { Editor } from '../editor';
import { createTimer, Timer } from '../timing';
import type { MilkdownPlugin } from '../utility';
import { ConfigReady } from './config';
import { prosePluginsCtx } from './prose-plugin-factory';
import { remarkPluginsCtx } from './remark-plugin-factory';

export type RemarkParser = Processor<RemarkOptions>;

export const InitReady = createTimer('InitReady');

export const initTimerCtx = createSlice<Timer[]>([], 'initTimer');
export const editorCtx = createSlice<Editor>({} as Editor, 'editor');

export const remarkCtx: Slice<RemarkParser> = createSlice<RemarkParser>(re(), 'remark');

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(remarkCtx, re())
            .inject(initTimerCtx, [ConfigReady])
            .record(InitReady);

        return async (ctx) => {
            await ctx.waitTimers(initTimerCtx);

            const remark = ctx.get(remarkCtx);
            const remarkPlugins = ctx.get(remarkPluginsCtx);

            const processor = remarkPlugins.reduce((acc, plug) => acc.use(plug), remark);

            ctx.set(remarkCtx, processor);
            ctx.done(InitReady);
        };
    };
