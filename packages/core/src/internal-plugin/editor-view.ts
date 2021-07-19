import { baseKeymap } from 'prosemirror-commands';
import { inputRules as createInputRules } from 'prosemirror-inputrules';
import { keymap as createKeymap } from 'prosemirror-keymap';
import { Node, Schema, DOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView, EditorProps } from 'prosemirror-view';
import { Render, createCtx, inputRulesCtx } from '..';
import { createTiming } from '../timing';
import { AnyRecord, MilkdownPlugin } from '../utility';
import { keymapCtx } from './keymap';
import { nodeViewCtx } from './node-view';
import { Parser, parserCtx } from './parser';
import { prosePluginsCtx } from './prose-plugin-factory';
import { schemaCtx } from './schema';
import { serializerCtx } from './serializer';

export type DocListener = (doc: Node) => void;
export type MarkdownListener = (getMarkdown: () => string) => void;
export type Listener = {
    doc?: DocListener[];
    markdown?: MarkdownListener[];
};
type DefaultValue = string | { type: 'html'; dom: HTMLElement } | { type: 'json'; value: AnyRecord };
type EditorOptions = {
    root: Element;
    defaultValue: DefaultValue;
    listener: Listener;
};

export const editorViewCtx = createCtx<EditorView>({} as EditorView);
export const editorOptionsCtx = createCtx<EditorOptions>({
    root: document.body,
    defaultValue: '',
    listener: {},
});
export const Complete = createTiming('complete');

const createViewContainer = (root: Element) => {
    const container = document.createElement('div');
    container.className = 'milkdown';
    root.appendChild(container);

    return container;
};

const prepareViewDom = (dom: Element) => {
    dom.classList.add('editor');
    dom.setAttribute('role', 'textbox');
};

const getDoc = (defaultValue: DefaultValue, parser: Parser, schema: Schema) => {
    if (typeof defaultValue === 'string') {
        return parser(defaultValue);
    }

    if (defaultValue.type === 'html') {
        return DOMParser.fromSchema(schema).parse(defaultValue.dom as unknown as Node);
    }

    if (defaultValue.type === 'json') {
        return Node.fromJSON(schema, defaultValue.value);
    }

    throw new Error();
};

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
        const prosePlugins = ctx.get(prosePluginsCtx);

        const state = EditorState.create({
            schema,
            doc: getDoc(options.defaultValue, parser, schema),
            plugins: [...keymap, ...prosePlugins, createKeymap(baseKeymap), createInputRules({ rules })],
        });
        const container = createViewContainer(options.root);
        const view = new EditorView(container, {
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
        prepareViewDom(view.dom);
        ctx.set(editorViewCtx, view);
        Complete.done();
    };
};
