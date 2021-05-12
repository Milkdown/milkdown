import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core/lib';
import { EditorState, Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
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
    cursorStatus: CursorStatus = CursorStatus.Empty;
    filter = '';
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
            this.status.cursorStatus = CursorStatus.Empty;
            this.status.filter = '';
            return null;
        }

        if (isEmpty) {
            this.status.cursorStatus = CursorStatus.Empty;
            this.status.filter = '';
            return placeholder(parent.pos + 1, 'Enter something');
        }

        if (isSlash) {
            this.status.cursorStatus = CursorStatus.Slash;
            return placeholder(parent.pos + 2, 'Enter command');
        }

        if (isSearch) {
            this.status.cursorStatus = CursorStatus.Slash;
            this.status.filter = parent.node.textContent.slice(1);
            return null;
        }

        this.status.cursorStatus = CursorStatus.Empty;
        this.status.filter = '';
        return null;
    };
}

class View {
    #dropdownElement: HTMLDivElement;
    #ctx: PluginReadyContext;
    constructor(private status: Status, editorView: EditorView, ctx: PluginReadyContext) {
        this.#dropdownElement = createDropdown();
        this.#ctx = ctx;

        editorView.dom.parentNode?.appendChild(this.#dropdownElement);
    }

    update(view: EditorView) {
        this.#ctx;
        view;

        this.renderDropdown();
    }

    destroy() {
        this.#dropdownElement.remove();
    }

    private renderDropdown() {
        const { cursorStatus } = this.status;

        if (cursorStatus === CursorStatus.Slash) {
            this.#dropdownElement.classList.remove('hide');
            return;
        }
        this.#dropdownElement.classList.add('hide');
    }
}
