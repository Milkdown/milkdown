import { Ctx } from '@milkdown/core';
import { calculateNodePosition } from '@milkdown/utils';
import { EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { Action } from '../item';
import { createDropdown } from '../utility';
import { CursorStatus, Status } from './status';

const createMouseManager = () => {
    let mouseLock = false;

    return {
        isLock: () => mouseLock,
        lock: () => {
            mouseLock = true;
        },
        unlock: () => {
            mouseLock = false;
        },
    };
};
type MouseManager = ReturnType<typeof createMouseManager>;

const handleClick =
    (status: Status, items: Action[], view: EditorView, dropdownElement: HTMLElement) =>
    (e: Event): void => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) return;

        if (!view) return;

        const stop = () => {
            e.stopPropagation();
            e.preventDefault();
        };

        const el = Object.values(items).find(({ $ }) => $.contains(target));
        if (!el) {
            if (status.isEmpty()) return;

            status.clearStatus();
            dropdownElement.classList.add('hide');
            stop();

            return;
        }

        stop();
        el.command(view.state, view.dispatch, view);
    };

const handleKeydown =
    (status: Status, view: EditorView, dropdownElement: HTMLElement, mouseManager: MouseManager) => (e: Event) => {
        if (!(e instanceof KeyboardEvent)) return;
        if (!mouseManager.isLock()) mouseManager.lock();

        const { key } = e;
        if (status.get().cursorStatus !== CursorStatus.Slash) {
            return;
        }
        if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(key)) {
            return;
        }
        let active = status.get().activeActions.findIndex((x) => x.$.classList.contains('active'));
        if (active < 0) active = 0;

        if (key === 'ArrowDown') {
            const next = active === status.get().activeActions.length - 1 ? 0 : active + 1;

            status.get().activeActions[active].$.classList.remove('active');
            status.get().activeActions[next].$.classList.add('active');
            scrollIntoView(status.get().activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        if (key === 'ArrowUp') {
            const next = active === 0 ? status.get().activeActions.length - 1 : active - 1;

            status.get().activeActions[active].$.classList.remove('active');
            status.get().activeActions[next].$.classList.add('active');
            scrollIntoView(status.get().activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        if (key === 'Escape') {
            if (status.isEmpty()) return;

            status.clearStatus();
            dropdownElement.classList.add('hide');
            return;
        }
        status.get().activeActions[active].command(view.state, view.dispatch, view);
        status.get().activeActions[active].$.classList.remove('active');
    };

const handleMouseMove = (mouseManager: MouseManager) => () => {
    mouseManager.unlock();
};

const handleMouseEnter = (status: Status, mouseManager: MouseManager) => (e: MouseEvent) => {
    if (mouseManager.isLock()) return;
    const active = status.get().activeActions.findIndex((x) => x.$.classList.contains('active'));
    if (active >= 0) {
        status.get().activeActions[active].$.classList.remove('active');
    }
    const { target } = e;
    if (!(target instanceof HTMLElement)) return;
    target.classList.add('active');
};

const handleMouseLeave = () => (e: MouseEvent) => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) return;
    target.classList.remove('active');
};

const renderDropdown = (status: Status, dropdownElement: HTMLElement, items: Action[]): boolean => {
    const { cursorStatus, filter } = status.get();

    if (cursorStatus !== CursorStatus.Slash) {
        dropdownElement.classList.add('hide');
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

    status.setActions(activeList);

    if (activeList.length === 0) {
        dropdownElement.classList.add('hide');
        return false;
    }

    activeList[0].$.classList.add('active');

    dropdownElement.classList.remove('hide');
    return true;
};

const calculatePosition = (view: EditorView, dropdownElement: HTMLElement) => {
    calculateNodePosition(view, dropdownElement, (selected, target, parent) => {
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
};

export const createView = (status: Status, items: Action[], view: EditorView, ctx: Ctx) => {
    const dropdownElement = createDropdown(ctx);
    const mouseManager = createMouseManager();
    const wrapper = view.dom.parentNode;
    if (!wrapper) return {};
    wrapper.appendChild(dropdownElement);

    const _mouseMove = handleMouseMove(mouseManager);
    const _mouseDown = handleClick(status, items, view, dropdownElement);
    const _keydown = handleKeydown(status, view, dropdownElement, mouseManager);

    items
        .filter((item) => item.enable(view.state.schema))
        .forEach(({ $ }) => {
            $.addEventListener('mouseenter', handleMouseEnter(status, mouseManager));
            $.addEventListener('mouseleave', handleMouseLeave());
            dropdownElement.appendChild($);
        });
    wrapper.addEventListener('mousemove', _mouseMove);
    wrapper.addEventListener('mousedown', _mouseDown);
    wrapper.addEventListener('keydown', _keydown);

    return {
        update: (view: EditorView) => {
            const show = renderDropdown(status, dropdownElement, items);

            if (!show) return;

            calculatePosition(view, dropdownElement);
        },

        destroy: () => {
            wrapper.removeEventListener('mousemove', _mouseMove);
            wrapper.removeEventListener('mousedown', _mouseDown);
            wrapper.removeEventListener('keydown', _keydown);
            dropdownElement.remove();
        },
    };
};
