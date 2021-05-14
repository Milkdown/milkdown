import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core/lib';
import { EditorState, Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import { Action, items } from './item';
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
    activeActions: Action[] = items;

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
        const { cursorStatus, activeActions } = this.status;
        if (cursorStatus !== CursorStatus.Slash || activeActions.length === 0) {
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
            return placeholder(parent.pos + 1, 'Type / to use the slash commands...');
        }

        if (isSlash) {
            this.status.setSlash();
            return placeholder(parent.pos + 2, 'Type to filter...');
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

        const view = this.#view;
        if (!view) return;

        const el = Object.values(items).find(({ $ }) => $.contains(target));
        if (!el) return;

        e.stopPropagation();
        e.preventDefault();

        el.command(this.#ctx)(view.state, view.dispatch);
    };

    #handleKeydown = (e: KeyboardEvent) => {
        const { key } = e;
        if (this.#status.cursorStatus !== CursorStatus.Slash) {
            return;
        }
        if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(key)) {
            return;
        }
        let active = this.#status.activeActions.findIndex((x) => x.$.classList.contains('active'));
        if (active < 0) active = 0;

        if (key === 'ArrowDown') {
            const next = active === this.#status.activeActions.length - 1 ? 0 : active + 1;

            this.#status.activeActions[active].$.classList.remove('active');
            this.#status.activeActions[next].$.classList.add('active');
            scrollIntoView(this.#status.activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        if (key === 'ArrowUp') {
            const next = active === 0 ? this.#status.activeActions.length - 1 : active - 1;

            this.#status.activeActions[active].$.classList.remove('active');
            this.#status.activeActions[next].$.classList.add('active');
            scrollIntoView(this.#status.activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        this.#status.activeActions[active].command(this.#ctx)(this.#view.state, this.#view.dispatch);
        this.#status.activeActions[active].$.classList.remove('active');
    };

    #handleMouseEnter = (e: MouseEvent) => {
        const active = this.#status.activeActions.findIndex((x) => x.$.classList.contains('active'));
        if (active >= 0) {
            this.#status.activeActions[active].$.classList.remove('active');
        }
        const { target } = e;
        if (!(target instanceof HTMLElement)) return;
        target.classList.add('active');
    };

    #handleMouseLeave = (e: MouseEvent) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) return;
        target.classList.remove('active');
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
            $.addEventListener('mouseenter', this.#handleMouseEnter);
            $.addEventListener('mouseleave', this.#handleMouseLeave);
            this.#dropdownElement.appendChild($);
        });
        this.#wrapper.addEventListener('mousedown', this.#handleClick);
        this.#wrapper.addEventListener('keydown', this.#handleKeydown);
    }

    update(view: EditorView) {
        const show = this.renderDropdown();

        if (!show) return;

        this.calculatePosition(view);
    }

    destroy() {
        this.#wrapper.removeEventListener('mousedown', this.#handleClick);
        this.#wrapper.removeEventListener('keydown', this.#handleKeydown);
        this.#dropdownElement.remove();
    }

    private renderDropdown(): boolean {
        const { cursorStatus, filter } = this.#status;

        if (cursorStatus !== CursorStatus.Slash) {
            this.#dropdownElement.classList.add('hide');
            return false;
        }

        const activeList = items
            .filter((item) => {
                item.$.classList.remove('active');
                const result = item.keyword.some((key) => key.includes(filter.toLocaleLowerCase()));
                if (result) {
                    return true;
                }
                item.$.classList.add('hide');
                return false;
            })
            .map((item) => {
                item.$.classList.remove('hide');
                return item;
            });

        this.#status.activeActions = activeList;

        if (activeList.length === 0) {
            this.#dropdownElement.classList.add('hide');
            return false;
        }

        activeList[0].$.classList.add('active');

        this.#dropdownElement.classList.remove('hide');
        return true;
    }

    private calculatePosition(view: EditorView) {
        const state = view.state;
        const { from } = state.selection;
        const start = view.coordsAtPos(from);

        const box = this.#dropdownElement.offsetParent?.getBoundingClientRect();
        if (!box) return;

        const rect = this.#dropdownElement.getBoundingClientRect();

        this.#dropdownElement.style.left = start.left - box.left + 'px';
        if (Math.abs(start.bottom - box.bottom) > rect.height) {
            this.#dropdownElement.style.bottom = '';
            this.#dropdownElement.style.top = start.top - box.top + 20 + 'px';
            return;
        }

        this.#dropdownElement.style.top = '';
        this.#dropdownElement.style.bottom = start.bottom - box.bottom + 190 + 'px';
    }
}
