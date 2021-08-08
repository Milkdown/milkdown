import { calculateNodePosition, findParentNode } from '@milkdown/utils';
import { EditorState, Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import { Action, transformAction, WrappedAction } from './item';
import { createDropdown } from './utility';

enum CursorStatus {
    Empty,
    Slash,
}

class SlashPlugin implements PluginSpec {
    items: Action[];
    status: Status;
    props: Props;

    constructor(items: WrappedAction[]) {
        this.items = items.map(transformAction);
        this.status = new Status(this.items);
        this.props = new Props(this.status);
    }

    key = new PluginKey('milkdown-prosemirror-slash-plugin');

    view = (editorView: EditorView) => new View(this.status, this.items, editorView);
}

class Status {
    #cursorStatus: CursorStatus = CursorStatus.Empty;
    #filter = '';
    activeActions: Action[];
    constructor(items: Action[]) {
        this.activeActions = items;
    }

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

        if (!parent || parent.node.childCount > 1 || !isTopLevel) {
            status.clearStatus();
            return;
        }

        const pos = parent.pos;
        const isEmpty = parent.node.content.size === 0;
        const isSlash = parent.node.textContent === '/' && state.selection.$from.parentOffset > 0;
        const isSearch = parent.node.textContent.startsWith('/') && state.selection.$from.parentOffset > 1;

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
    #items: Action[];
    #mouseLock: boolean;

    #handleClick = (e: Event) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const view = this.#view;
        if (!view) return;

        const el = Object.values(this.#items).find(({ $ }) => $.contains(target));
        if (!el) {
            if (this.#status.cursorStatus === CursorStatus.Empty) {
                return;
            }
            this.#status.clearStatus();
            this.#dropdownElement.classList.add('hide');
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        el.command(view.state, view.dispatch, view);
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
        this.#status.activeActions[active].command(this.#view.state, this.#view.dispatch);
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

    constructor(status: Status, items: Action[], editorView: EditorView) {
        this.#status = status;
        this.#dropdownElement = createDropdown();
        this.#view = editorView;
        this.#mouseLock = false;
        this.#items = items;

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

        if (!show) {
            return;
        }

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

        const activeList = this.#items
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
        calculateNodePosition(view, this.#dropdownElement, (selected, target, parent) => {
            let left = selected.left - parent.left;
            let top = selected.bottom - parent.top + 14;

            if (left < 0) {
                left = 0;
            }

            if (window.innerHeight - selected.bottom < target.height) {
                top = selected.top - parent.top - target.height - 14;
            }
            return [top, left];
        });
    }
}

export const slashPlugin = (items: WrappedAction[]) => new Plugin(new SlashPlugin(items));
