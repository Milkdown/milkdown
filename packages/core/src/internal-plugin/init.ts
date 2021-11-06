/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { InputRule, MarkViewFactory, NodeViewFactory, Plugin, ViewFactory } from '@milkdown/prose';
import { remark } from 'remark';

import type { Editor } from '../editor';
import { RemarkParser, RemarkPlugin } from '../utility';
import { ConfigReady } from './config';

export const InitReady = createTimer('InitReady');

export const initTimerCtx = createSlice<Timer[]>([], 'initTimer');
export const editorCtx = createSlice<Editor>({} as Editor, 'editor');

export const inputRulesCtx = createSlice<InputRule[]>([], 'inputRules');
export const prosePluginsCtx = createSlice<Plugin[]>([], 'prosePlugins');
export const remarkPluginsCtx = createSlice<RemarkPlugin[]>([], 'remarkPlugins');

type View = [nodeId: string, view: ViewFactory | NodeViewFactory | MarkViewFactory];
export const viewCtx = createSlice<View[]>([], 'nodeView');

export const remarkCtx = createSlice(remark(), 'remark');

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(inputRulesCtx)
            .inject(viewCtx)
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
