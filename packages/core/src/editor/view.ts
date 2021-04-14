import type { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export class View {
    public readonly view: EditorView;
    constructor(root: Element, state: EditorState, private readonly onChange: (view: EditorView) => void) {
        const container = this.createViewContainer(root);
        const view = new EditorView(container, {
            state,
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
