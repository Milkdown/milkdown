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
    cleanupFn?: () => void;

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
    handleKeyDown = (_: EditorView, event: Event) => {
        const { cursorStatus } = this.status;
        if (cursorStatus !== CursorStatus.Slash) {
            return false;
        }
        if (!(event instanceof KeyboardEvent)) {
            return false;
        }

        if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
            return false;
        }

        return true;
    };
    decorations = (state: EditorState) => {
        const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);
        if (!parent) {
            this.status.clearStatus();
            return null;
        }

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
    #wrapper: HTMLElement;
    #ctx: PluginReadyContext;
    #status: Status;
    #view: EditorView;

    #handleClick = (e: Event) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        const view = this.#view;
        if (!view) return;
        Object.values(items).forEach(({ $, command }) => {
            if ($.contains(target)) {
                command(this.#ctx)(view.state, view.dispatch);
            }
        });
    };

    #handleKeydown = (e: Event) => {
        if (!(e instanceof KeyboardEvent)) {
            return;
        }
        const { key } = e;
        console.log(key);
    };

    constructor(status: Status, editorView: EditorView, ctx: PluginReadyContext) {
        this.#status = status;
        this.#dropdownElement = createDropdown();
        this.#ctx = ctx;
        this.#view = editorView;

        const { parentNode } = editorView.dom;
        if (!parentNode) {
            throw new Error();
        }
        this.#wrapper = parentNode as HTMLElement;

        parentNode.appendChild(this.#dropdownElement);
        items.forEach(({ $ }) => {
            this.#dropdownElement.appendChild($);
        });
        this.#dropdownElement.addEventListener('mousedown', this.#handleClick);
        this.#wrapper.addEventListener('keydown', this.#handleKeydown);
    }

    update(view: EditorView) {
        const show = this.renderDropdown();

        if (!show) return;

        this.calculatePosition(view);
    }

    destroy() {
        this.#dropdownElement.removeEventListener('mousedown', this.#handleClick);
        this.#wrapper.removeEventListener('keydown', this.#handleKeydown);
        this.#dropdownElement.remove();
    }

    private renderDropdown(): boolean {
        const { cursorStatus, filter } = this.#status;

        if (cursorStatus !== CursorStatus.Slash) {
            this.#dropdownElement.classList.add('hide');
            return false;
        }

        items.forEach((item) => {
            if (item.keyword.some((key) => key.includes(filter.toLocaleLowerCase()))) {
                item.$.classList.remove('hide');
                return;
            }
            item.$.classList.add('hide');
        });

        if (items.every(({ $ }) => $.classList.contains('hide'))) {
            this.#dropdownElement.classList.add('hide');
            return false;
        }

        this.#dropdownElement.classList.remove('hide');
        return true;
    }

    private calculatePosition(view: EditorView) {
        const state = view.state;
        const { from } = state.selection;
        const start = view.coordsAtPos(from);

        const box = this.#dropdownElement.offsetParent?.getBoundingClientRect();
        if (!box) return;

        this.#dropdownElement.style.left = start.left - box.left + 'px';
        this.#dropdownElement.style.top = start.top - box.top + 20 + 'px';
    }
}
