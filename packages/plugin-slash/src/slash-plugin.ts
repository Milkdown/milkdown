import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core/lib';
import { EditorState, Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { items } from './item';
import { createDropdown, createPlaceholder, findParentNode } from './utility';

export const slashPlugin = createProsemirrorPlugin('slash', (ctx) => [plugin(ctx)]);

const plugin = (ctx: PluginReadyContext) => new Plugin(new SlashPlugin(ctx));

enum CursorStatus {
    Empty,
    Slash,
}

class SlashPlugin implements PluginSpec {
    constructor(private ctx: PluginReadyContext) {}

    key = new PluginKey('milkdown-prosemirror-slash-plugin');

    status = new Status();

    props = new Props(this.status);

    view = (editorView: EditorView) => new View(this.status, editorView, this.ctx);
}

class Status {
    #cursorStatus: CursorStatus = CursorStatus.Empty;
    #filter = '';

    clearStatus() {
        this.#cursorStatus = CursorStatus.Empty;
        this.#filter = '';
    }

    setSlash(filter = '') {
        this.#cursorStatus = CursorStatus.Slash;
        this.#filter = filter;
    }

    get cursorStatus() {
        return this.#cursorStatus;
    }

    get filter() {
        return this.#filter;
    }
}

class Props {
    constructor(private status: Status) {}
    decorations = (state: EditorState) => {
        const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);
        if (!parent) return null;

        const isTopLevel = state.selection.$from.depth === 1;
        const isEmpty = parent.node.content.size === 0;
        const isSlash = parent.node.textContent === '/';
        const isSearch = parent.node.textContent.startsWith('/');
        const placeholder = (pos: number, text: string) =>
            DecorationSet.create(state.doc, [Decoration.widget(pos, createPlaceholder(text))]);

        if (!isTopLevel) {
            this.status.clearStatus();
            return null;
        }

        if (isEmpty) {
            this.status.clearStatus();
            return placeholder(parent.pos + 1, 'Enter something');
        }

        if (isSlash) {
            this.status.setSlash();
            return placeholder(parent.pos + 2, 'Enter command');
        }

        if (isSearch) {
            this.status.setSlash(parent.node.textContent.slice(1));
            return null;
        }

        this.status.clearStatus();
        return null;
    };
}

class View {
    #dropdownElement: HTMLDivElement;
    #ctx: PluginReadyContext;
    #status: Status;
    #view: EditorView;
    constructor(status: Status, editorView: EditorView, ctx: PluginReadyContext) {
        this.#status = status;
        this.#dropdownElement = createDropdown();
        this.#ctx = ctx;
        this.#view = editorView;

        editorView.dom.parentNode?.appendChild(this.#dropdownElement);
        items.forEach(({ $ }) => {
            this.#dropdownElement.appendChild($);
        });
        this.#dropdownElement.addEventListener('mousedown', this.listener);
    }

    update(view: EditorView) {
        const show = this.renderDropdown();

        if (!show) {
            return;
        }
        const { filter } = this.#status;
        items.forEach((item) => {
            if (item.keyword.some((key) => key.includes(filter))) {
                item.$.classList.remove('hide');
                return;
            }
            item.$.classList.add('hide');
        });
        view;
        console.log(filter);
    }

    destroy() {
        this.#dropdownElement.removeEventListener('mousedown', this.listener);
        this.#dropdownElement.remove();
    }

    private renderDropdown(): boolean {
        const { cursorStatus } = this.#status;

        if (cursorStatus === CursorStatus.Slash) {
            this.#dropdownElement.classList.remove('hide');
            return true;
        }
        this.#dropdownElement.classList.add('hide');
        return false;
    }

    private listener = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        const view = this.#view;
        if (!view) return;
        Object.values(items).forEach(({ $, command }) => {
            if ($.contains(e.target as Element)) {
                command(this.#ctx)(view.state, view.dispatch);
            }
        });
    };
}
