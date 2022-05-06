/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Slice, Timer } from '@milkdown/ctx';
import { MarkViewFactory, NodeViewFactory, ViewFactory } from '@milkdown/prose';
import { InputRule } from '@milkdown/prose/inputrules';
import { Plugin } from '@milkdown/prose/state';
import { remark, RemarkParser, RemarkPlugin } from '@milkdown/transformer';

import type { Editor } from '../editor';
import { ThemeReady } from './theme';

export const InitReady = createTimer('InitReady');

export const initTimerCtx = createSlice([] as Timer[], 'initTimer');
export const editorCtx = createSlice({} as Editor, 'editor');

export const inputRulesCtx = createSlice([] as InputRule[], 'inputRules');
export const prosePluginsCtx = createSlice([] as Plugin[], 'prosePlugins');
export const remarkPluginsCtx = createSlice([] as RemarkPlugin[], 'remarkPlugins');

type View = [nodeId: string, view: ViewFactory | NodeViewFactory | MarkViewFactory];
export const viewCtx = createSlice([] as View[], 'nodeView');

export const remarkCtx: Slice<RemarkParser> = createSlice(remark(), 'remark');

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(inputRulesCtx)
            .inject(viewCtx)
            .inject(remarkCtx, remark())
            .inject(initTimerCtx, [ThemeReady])
            .record(InitReady);

        return async (ctx) => {
            await ctx.waitTimers(initTimerCtx);

            ctx.done(InitReady);
        };
    };
