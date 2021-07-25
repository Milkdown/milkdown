import { findParentNode } from '@milkdown/utils';
import { EditorState, Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import { Action, items } from './item';
import { createDropdown } from './utility';

enum CursorStatus {
    Empty,
    Slash,
}

class SlashPlugin implements PluginSpec {
    key = new PluginKey('milkdown-prosemirror-slash-plugin');

    status = new Status();

    props = new Props(this.status);

    view = (editorView: EditorView) => new View(this.status, editorView);
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
        const { status } = this;
        const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);
        const isTopLevel = state.selection.$from.depth === 1;

        if (!parent || !isTopLevel) {
            status.clearStatus();
            return;
        }

        const pos = parent.pos;
        const isEmpty = parent.node.content.size === 0;
        const isSlash = parent.node.textContent === '/';
        const isSearch = parent.node.textContent.startsWith('/');

        if (isEmpty) {
            status.clearStatus();
            const text = 'Type / to use the slash commands...';
            return DecorationSet.create(state.doc, [
                Decoration.node(pos, pos + parent.node.nodeSize, {
                    class: 'empty-node',
                    'data-text': text,
                }),
            ]);
        }

        if (isSlash) {
            status.setSlash();
            const text = 'Type to filter...';
            return DecorationSet.create(state.doc, [
                Decoration.node(pos, pos + parent.node.nodeSize, {
                    class: 'empty-node is-slash',
                    'data-text': text,
                }),
            ]);
        }

        if (isSearch) {
            status.setSlash(parent.node.textContent.slice(1));
            return null;
        }

        status.clearStatus();
        return null;
    };
}

class View {
    #dropdownElement: HTMLDivElement;
    #wrapper: HTMLElement;
    #status: Status;
    #view: EditorView;
    #mouseLock: boolean;

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

        el.command(view.state.schema)(view.state, view.dispatch);
    };

    #handleKeydown = (e: KeyboardEvent) => {
        if (!this.#mouseLock) {
            this.#mouseLock = true;
        }
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
        this.#status.activeActions[active].command(this.#view.state.schema)(this.#view.state, this.#view.dispatch);
        this.#status.activeActions[active].$.classList.remove('active');
    };

    #handleMouseEnter = (e: MouseEvent) => {
        if (this.#mouseLock) return;
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

    #handleMouseMove = () => {
        if (this.#mouseLock) {
            this.#mouseLock = false;
        }
    };

    constructor(status: Status, editorView: EditorView) {
        this.#status = status;
        this.#dropdownElement = createDropdown();
        this.#view = editorView;
        this.#mouseLock = false;

        const { parentNode } = editorView.dom;
        if (!parentNode) {
            throw new Error();
        }
        this.#wrapper = parentNode as HTMLElement;

        parentNode.appendChild(this.#dropdownElement);
        this.#wrapper.addEventListener('mousemove', this.#handleMouseMove);
        items
            .filter((item) => item.enable(this.#view.state.schema))
            .forEach(({ $ }) => {
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

        const node = view.domAtPos(from).node as HTMLElement;
        const rect = node.getBoundingClientRect();
        const bound = this.#dropdownElement.getBoundingClientRect();

        let leftPx = rect.left;
        let topPx = rect.bottom;

        if (leftPx < 0) {
            leftPx = 0;
        }

        if (window.innerHeight - rect.bottom < bound.height) {
            topPx = rect.top - bound.height;
        }

        this.#dropdownElement.style.left = leftPx + 'px';
        this.#dropdownElement.style.top = topPx + 'px';
    }
}

export const slashPlugin = new Plugin(new SlashPlugin());
