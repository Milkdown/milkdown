import type { EditorState } from 'prosemirror-state';
import { EditorProps, EditorView } from 'prosemirror-view';
import { NodeView, MarkView } from 'src/utility/prosemirror';

export class View {
    public readonly view: EditorView;
    constructor(
        root: Element,
        state: EditorState,
        nodeViews: Record<string, NodeView | MarkView>,
        private readonly onChange: (view: EditorView) => void,
    ) {
        const container = this.createViewContainer(root);
        const view = new EditorView(container, {
            state,
            nodeViews: nodeViews as EditorProps['nodeViews'],
            dispatchTransaction: (tr) => {
                const nextState = this.view.state.apply(tr);
                view.updateState(nextState);
                this.onChange(this.view);
            },
        });
        this.prepareViewDom(view.dom);
        this.view = view;
    }

    private createViewContainer(root: Element) {
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
