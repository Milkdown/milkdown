import { EditorProps, EditorView } from 'prosemirror-view';
import { createCtx } from '../context';
import { createTimer, Timer } from '../timing';
import { MilkdownPlugin } from '../utility';
import { editorStateCtx, EditorStateReady } from './editor-state';
import { nodeViewCtx, NodeViewReady } from './node-view';

type EditorOptions = Omit<ConstructorParameters<typeof EditorView>[1], 'state'>;

export const editorViewCtx = createCtx<EditorView>({} as EditorView);
export const editorViewOptionsCtx = createCtx<EditorOptions>({});
export const rootCtx = createCtx<Node | undefined>(document.body);
export const editorViewTimerCtx = createCtx<Timer[]>([]);

export const Complete = createTimer('complete');

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
        .record(Complete);

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
        ctx.done(Complete);
    };
};
