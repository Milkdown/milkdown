import { baseKeymap } from 'prosemirror-commands';
import { inputRules as createInputRules } from 'prosemirror-inputrules';
import { keymap as createKeymap } from 'prosemirror-keymap';
import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Complete, createCtx, inputRulesCtx } from '..';
import { MilkdownPlugin } from '../utility';
import { keymapCtx } from './keymap';
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
export const editorOptions = createCtx<EditorOptions>({
    root: document.body,
    defaultValue: '',
    listener: {},
});

export const editorView: MilkdownPlugin = (pre) => {
    pre.ctx(editorViewCtx).ctx(editorOptions);

    return async (ctx) => {
        await Complete();

        const schema = ctx.use(schemaCtx).get();
        const parser = ctx.use(parserCtx).get();
        const serializer = ctx.use(serializerCtx).get();
        const rules = ctx.use(inputRulesCtx).get();
        const keymap = ctx.use(keymapCtx).get();
        const options = ctx.use(editorOptions).get();

        const state = EditorState.create({
            schema,
            doc: parser(options.defaultValue),
            plugins: [...keymap, createKeymap(baseKeymap), createInputRules({ rules })],
        });
        const view = new EditorView(document.body, {
            state,
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
    };
};
