import { inputRules as createInputRules } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import { baseKeymap } from 'prosemirror-commands';
import { keymap as createKeymap } from 'prosemirror-keymap';
import { history, redo, undo } from 'prosemirror-history';
import { EditorProps, EditorView } from 'prosemirror-view';

import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { Listener, PluginReadyContext, ProsemirrorReadyContext } from './context';

export type ViewLoaderOptions = {
    root: Element;
    defaultValue: string;
    listener: Listener;
};

export class ViewLoader extends Atom<PluginReadyContext, ProsemirrorReadyContext, ViewLoaderOptions> {
    id = 'viewLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.PluginReady;
    main() {
        const { nodeViews, serializer } = this.context;
        const { listener } = this.options;
        const state = this.createState();
        const container = this.createViewContainer();
        const view = new EditorView(container, {
            state,
            nodeViews: nodeViews as EditorProps['nodeViews'],
            dispatchTransaction: (tr) => {
                const nextState = view.state.apply(tr);
                view.updateState(nextState);
                listener.markdown?.forEach((l) => {
                    l(() => serializer(view.state.doc));
                });
            },
        });
        this.prepareViewDom(view.dom);
        this.updateContext({
            editorView: view,
        });
    }

    private createState() {
        const { parser, schema, inputRules, keymap, prosemirrorPlugins } = this.context;
        const { defaultValue } = this.options;

        const doc = parser(defaultValue);
        return EditorState.create({
            schema,
            doc,
            plugins: [
                history(),
                createInputRules({ rules: inputRules }),
                ...keymap,
                createKeymap({
                    'Mod-z': undo,
                    'Shift-Mod-z': redo,
                }),
                createKeymap(baseKeymap),
                ...prosemirrorPlugins,
            ],
        });
    }

    private createViewContainer() {
        const { root } = this.options;
        const container = document.createElement('div');
        container.className = 'milkdown';
        root.appendChild(container);

        return container;
    }

    private prepareViewDom(dom: Element) {
        dom.classList.add('editor');
        dom.setAttribute('role', 'textbox');
    }
}
