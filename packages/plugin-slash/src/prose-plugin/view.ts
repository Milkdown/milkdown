import { Ctx } from '@milkdown/core';
import { calculateNodePosition } from '@milkdown/utils';
import { EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { Action } from '../item';
import { createDropdown } from '../utility';
import { CursorStatus, Status } from './status';

export class View {
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
            if (this.#status.get().cursorStatus === CursorStatus.Empty) {
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
        if (this.#status.get().cursorStatus !== CursorStatus.Slash) {
            return;
        }
        if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(key)) {
            return;
        }
        let active = this.#status.get().activeActions.findIndex((x) => x.$.classList.contains('active'));
        if (active < 0) active = 0;

        if (key === 'ArrowDown') {
            const next = active === this.#status.get().activeActions.length - 1 ? 0 : active + 1;

            this.#status.get().activeActions[active].$.classList.remove('active');
            this.#status.get().activeActions[next].$.classList.add('active');
            scrollIntoView(this.#status.get().activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        if (key === 'ArrowUp') {
            const next = active === 0 ? this.#status.get().activeActions.length - 1 : active - 1;

            this.#status.get().activeActions[active].$.classList.remove('active');
            this.#status.get().activeActions[next].$.classList.add('active');
            scrollIntoView(this.#status.get().activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        this.#status.get().activeActions[active].command(this.#view.state, this.#view.dispatch, this.#view);
        this.#status.get().activeActions[active].$.classList.remove('active');
    };

    #handleMouseEnter = (e: MouseEvent) => {
        if (this.#mouseLock) return;
        const active = this.#status.get().activeActions.findIndex((x) => x.$.classList.contains('active'));
        if (active >= 0) {
            this.#status.get().activeActions[active].$.classList.remove('active');
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

    constructor(status: Status, items: Action[], editorView: EditorView, ctx: Ctx) {
        this.#status = status;
        this.#dropdownElement = createDropdown(ctx);
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
        const { cursorStatus, filter } = this.#status.get();

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

        this.#status.setActions(activeList);

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
