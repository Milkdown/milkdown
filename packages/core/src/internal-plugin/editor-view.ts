/* Copyright 2021, Milkdown by Mirone. */
import { EditorProps, EditorView } from 'prosemirror-view';

import { createSlice } from '../context';
import { createTimer, Timer } from '../timing';
import { MilkdownPlugin } from '../utility';
import { editorStateCtx, EditorStateReady } from './editor-state';
import { nodeViewCtx, NodeViewReady } from './node-view';

type EditorOptions = Omit<ConstructorParameters<typeof EditorView>[1], 'state'>;

export const editorViewCtx = createSlice<EditorView>({} as EditorView, 'editorView');
export const editorViewOptionsCtx = createSlice<EditorOptions>({}, 'editorViewOptions');
export const rootCtx = createSlice<Node | undefined | null>(document.body, 'root');
export const editorViewTimerCtx = createSlice<Timer[]>([], 'editorViewTimer');

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
        .inject(editorViewTimerCtx, [EditorStateReady, NodeViewReady])
        .record(EditorViewReady);

    return async (ctx) => {
        await ctx.waitTimers(editorViewTimerCtx);

        const state = ctx.get(editorStateCtx);
        const options = ctx.get(editorViewOptionsCtx);
        const nodeView = ctx.get(nodeViewCtx);
        const root = ctx.get(rootCtx);

        const container = root ? createViewContainer(root) : undefined;
        const view = new EditorView(container, {
            state,
            nodeViews: nodeView as EditorProps['nodeViews'],
            ...options,
        });
        prepareViewDom(view.dom);
        ctx.set(editorViewCtx, view);
        ctx.done(EditorViewReady);
    };
};
