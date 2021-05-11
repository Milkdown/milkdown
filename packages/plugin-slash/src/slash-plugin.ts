import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core/lib';
import { EditorState, Plugin, PluginSpec } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { createDropdown, createPlaceholder, findParentNode } from './utility';

export const slashPlugin = createProsemirrorPlugin('slash', (ctx) => [plugin(ctx)]);

const plugin = (ctx: PluginReadyContext) => new Plugin(new SlashPlugin(ctx));

enum CursorStatus {
    None,
    Empty,
    Slash,
}

class SlashPlugin implements PluginSpec {
    constructor(private ctx: PluginReadyContext) {}

    status = new Status();

    props = new Props(this.status);

    view = (editorView: EditorView) => new View(this.status, editorView, this.ctx);
}

class Status {
    cursorStatus: CursorStatus = CursorStatus.None;
}

class Props {
    constructor(private status: Status) {}
    decorations = (state: EditorState) => {
        const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);
        if (!parent) return null;

        const isTopLevel = state.selection.$from.depth === 1;
        const isEmpty = parent.node.content.size === 0;
        const isSlash = parent.node.textContent === '/';
        const placeholder = (pos: number, text: string) =>
            DecorationSet.create(state.doc, [Decoration.widget(pos, createPlaceholder(text))]);

        if (!isTopLevel) {
            return null;
        }

        if (isEmpty) {
            this.status.cursorStatus = CursorStatus.Empty;
            return placeholder(parent.pos + 1, 'Enter something');
        }

        if (isSlash) {
            this.status.cursorStatus = CursorStatus.Slash;
            return placeholder(parent.pos + 2, 'Enter command');
        }

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

        console.log(this.status);
    }

    destroy() {
        this.#dropdownElement.remove();
    }
}
