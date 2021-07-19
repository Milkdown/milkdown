import { baseKeymap } from 'prosemirror-commands';
import { inputRules as createInputRules } from 'prosemirror-inputrules';
import { keymap as createKeymap } from 'prosemirror-keymap';
import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView, EditorProps } from 'prosemirror-view';
import { Render, createCtx, inputRulesCtx } from '..';
import { createTiming } from '../timing';
import { MilkdownPlugin } from '../utility';
import { keymapCtx } from './keymap';
import { nodeViewCtx } from './node-view';
import { parserCtx } from './parser';
import { schemaCtx } from './schema';
import { serializerCtx } from './serializer';

export type DocListener = (doc: Node) => void;
export type MarkdownListener = (getMarkdown: () => string) => void;
export type Listener = {
    doc?: DocListener[];
    markdown?: MarkdownListener[];
};

type EditorOptions = {
    root: Element;
    defaultValue: string;
    listener: Listener;
};

export const editorViewCtx = createCtx<EditorView>({} as EditorView);
export const editorOptionsCtx = createCtx<EditorOptions>({
    root: document.body,
    defaultValue: '',
    listener: {},
});
export const Complete = createTiming('complete');

export const editorView: MilkdownPlugin = (pre) => {
    pre.inject(editorViewCtx).inject(editorOptionsCtx);

    return async (ctx) => {
        await Render();

        const schema = ctx.get(schemaCtx);
        const parser = ctx.get(parserCtx);
        const serializer = ctx.get(serializerCtx);
        const rules = ctx.get(inputRulesCtx);
        const keymap = ctx.get(keymapCtx);
        const options = ctx.get(editorOptionsCtx);
        const nodeView = ctx.get(nodeViewCtx);

        const state = EditorState.create({
            schema,
            doc: parser(options.defaultValue),
            plugins: [...keymap, createKeymap(baseKeymap), createInputRules({ rules })],
        });
        const view = new EditorView(options.root, {
            state,
            nodeViews: nodeView as EditorProps['nodeViews'],
            dispatchTransaction: (tr) => {
                const nextState = view.state.apply(tr);
                view.updateState(nextState);
                options.listener.markdown?.forEach((markdownListener) => {
                    markdownListener(() => serializer(view.state.doc));
                });
                options.listener.doc?.forEach((docListener) => {
                    docListener(view.state.doc);
                });
            },
        });
        ctx.use(editorViewCtx).set(view);
        Complete.done();
    };
};
