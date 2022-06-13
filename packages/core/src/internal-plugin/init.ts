/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Slice, Timer } from '@milkdown/ctx';
import { InputRule } from '@milkdown/prose/inputrules';
import { Plugin } from '@milkdown/prose/state';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';
import { remark, RemarkParser, RemarkPlugin } from '@milkdown/transformer';

import type { Editor } from '../editor';
import { ThemeReady } from './theme';

export const InitReady = createTimer('InitReady');

export const initTimerCtx = createSlice([] as Timer[], 'initTimer');
export const editorCtx = createSlice({} as Editor, 'editor');

export const inputRulesCtx = createSlice([] as InputRule[], 'inputRules');
export const prosePluginsCtx = createSlice([] as Plugin[], 'prosePlugins');
export const remarkPluginsCtx = createSlice([] as RemarkPlugin[], 'remarkPlugins');

type NodeView = [nodeId: string, view: NodeViewConstructor];
export const nodeViewCtx = createSlice([] as NodeView[], 'nodeView');
type MarkView = [nodeId: string, view: MarkViewConstructor];
export const markViewCtx = createSlice([] as MarkView[], 'markView');

export const remarkCtx: Slice<RemarkParser> = createSlice(remark(), 'remark');

export const init =
    (editor: Editor): MilkdownPlugin =>
    (pre) => {
        pre.inject(editorCtx, editor)
            .inject(prosePluginsCtx)
            .inject(remarkPluginsCtx)
            .inject(inputRulesCtx)
            .inject(nodeViewCtx)
            .inject(markViewCtx)
            .inject(remarkCtx, remark())
            .inject(initTimerCtx, [ThemeReady])
            .record(InitReady);

        return async (ctx) => {
            await ctx.waitTimers(initTimerCtx);

            ctx.done(InitReady);
        };
    };
