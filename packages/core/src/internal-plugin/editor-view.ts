/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { EditorView, ViewFactory } from '@milkdown/prose';

import { editorStateCtx, EditorStateReady } from './editor-state';
import { viewCtx } from './init';

type EditorOptions = Omit<ConstructorParameters<typeof EditorView>[1], 'state'>;

type RootType = Node | undefined | null | string;

export const editorViewCtx = createSlice({} as EditorView, 'editorView');
export const editorViewOptionsCtx = createSlice({} as EditorOptions, 'editorViewOptions');
export const rootCtx = createSlice(null as RootType, 'root');
export const editorViewTimerCtx = createSlice([] as Timer[], 'editorViewTimer');

export const EditorViewReady = createTimer('EditorViewReady');

const createViewContainer = (root: Node) => {
    const container = document.createElement('div');
    container.className = 'milkdown';
    root.appendChild(container);

    return container;
};

const prepareViewDom = (dom: Element) => {
    dom.classList.add('editor');
    dom.setAttribute('role', 'textbox');
};

export const editorView: MilkdownPlugin = (pre) => {
    pre.inject(rootCtx, document.body)
        .inject(editorViewCtx)
        .inject(editorViewOptionsCtx)
        .inject(editorViewTimerCtx, [EditorStateReady])
        .record(EditorViewReady);

    return async (ctx) => {
        await ctx.waitTimers(editorViewTimerCtx);

        const state = ctx.get(editorStateCtx);
        const options = ctx.get(editorViewOptionsCtx);
        const nodeViews = Object.fromEntries(ctx.get(viewCtx) as [string, ViewFactory][]);
        const root = ctx.get(rootCtx) || document.body;
        const el = typeof root === 'string' ? document.querySelector(root) : root;

        const container = el ? createViewContainer(el) : undefined;
        const view = new EditorView(container, {
            state,
            nodeViews,
            ...options,
        });
        prepareViewDom(view.dom);
        ctx.set(editorViewCtx, view);
        ctx.done(EditorViewReady);
    };
};
