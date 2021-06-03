import { inputRules as createInputRules } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { baseKeymap } from 'prosemirror-commands';
import { keymap as createKeymap } from 'prosemirror-keymap';
import { history, redo, undo } from 'prosemirror-history';
import { EditorProps, EditorView } from 'prosemirror-view';

import { Atom } from '../abstract';
import { LoadState } from '../constant';

export type DocListener = (doc: Node) => void;
export type MarkdownListener = (getMarkdown: () => string) => void;
export type Listener = {
    doc?: DocListener[];
    markdown?: MarkdownListener[];
};

export type ViewLoaderOptions = {
    root: Element;
    defaultValue: string;
    listener: Listener;
    editable?: (editorState: EditorState) => boolean;
};

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
        this.#prepareViewDom(view.dom);
        this.updateContext({
            editorView: view,
        });
    }

    #createState() {
        const { parser, schema, inputRules, keymap, prosemirrorPlugins } = this.context;
        const { defaultValue } = this.options;

        const doc = parser(defaultValue);
        return EditorState.create({
            schema,
            doc,
            plugins: [
                history(),
                createKeymap({
                    'Mod-z': undo,
                    'Shift-Mod-z': redo,
                }),
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
