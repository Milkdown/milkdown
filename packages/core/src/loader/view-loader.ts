import { inputRules as createInputRules } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import { Node, DOMParser } from 'prosemirror-model';
import { baseKeymap } from 'prosemirror-commands';
import { keymap as createKeymap } from 'prosemirror-keymap';
import { EditorProps, EditorView } from 'prosemirror-view';

import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { AnyRecord } from '../utility';

export type DocListener = (doc: Node) => void;
export type MarkdownListener = (getMarkdown: () => string) => void;
export type Listener = {
    doc?: DocListener[];
    markdown?: MarkdownListener[];
};

export type ViewLoaderOptions = {
    root: Element;
    defaultValue: string | { type: 'html'; dom: HTMLElement } | { type: 'json'; value: AnyRecord };
    listener: Listener;
    editable?: (editorState: EditorState) => boolean;
};

const hasKey = <T>(obj: T, k: string | number | symbol): k is keyof T => k in obj;

export class ViewLoader extends Atom<LoadState.Complete, ViewLoaderOptions> {
    override readonly id = 'viewLoader';
    override readonly loadAfter = LoadState.Complete;
    override main() {
        const { nodeViews, serializer } = this.context;
        const { listener, editable } = this.options;
        const state = this.#createState();
        const container = this.#createViewContainer();
        const view = new EditorView(container, {
            state,
            nodeViews: nodeViews as EditorProps['nodeViews'],
            editable,
            dispatchTransaction: (tr) => {
                const nextState = view.state.apply(tr);
                view.updateState(nextState);
                listener.markdown?.forEach((l) => {
                    l(() => serializer(view.state.doc));
                });
                listener.doc?.forEach((l) => {
                    l(view.state.doc);
                });
            },
        });
        const viewProxy = new Proxy(view, {
            get: (target, prop) => {
                if (prop === 'destroy') {
                    return () => {
                        target.destroy();
                        container.remove();
                    };
                }
                return hasKey(target, prop) ? target[prop] : undefined;
            },
        });
        this.#prepareViewDom(view.dom);
        this.updateContext({
            editorView: viewProxy,
        });
    }

    #getDoc() {
        const { parser, schema } = this.context;
        const { defaultValue } = this.options;

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
    }

    #createState() {
        const { schema, inputRules, keymap, prosemirrorPlugins } = this.context;
        const doc = this.#getDoc();
        return EditorState.create({
            schema,
            doc,
            plugins: [
                ...keymap,
                ...prosemirrorPlugins,
                createKeymap(baseKeymap),
                createInputRules({ rules: inputRules }),
            ],
        });
    }

    #createViewContainer() {
        const { root } = this.options;
        const container = document.createElement('div');
        container.className = 'milkdown';
        root.appendChild(container);

        return container;
    }

    #prepareViewDom(dom: Element) {
        dom.classList.add('editor');
        dom.setAttribute('role', 'textbox');
    }
}
