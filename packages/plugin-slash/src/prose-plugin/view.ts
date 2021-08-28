import { Ctx } from '@milkdown/core';
import { calculateNodePosition } from '@milkdown/utils';
import { EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { Action } from '../item';
import { createDropdown } from '../utility';
import { Status } from './status';

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
        if (!status.isSlash()) return;
        if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(key)) return;

        const { activeActions } = status.get();

        let active = activeActions.findIndex(({ $ }) => $.classList.contains('active'));
        if (active < 0) active = 0;

        const moveActive = (next: number) => {
            activeActions[active].$.classList.remove('active');
            activeActions[next].$.classList.add('active');
            scrollIntoView(activeActions[next].$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
        };

        if (key === 'ArrowDown') {
            const next = active === activeActions.length - 1 ? 0 : active + 1;

            moveActive(next);
            return;
        }

        if (key === 'ArrowUp') {
            const next = active === 0 ? activeActions.length - 1 : active - 1;

            moveActive(next);
            return;
        }

        if (key === 'Escape') {
            if (status.isEmpty()) return;

            status.clearStatus();
            dropdownElement.classList.add('hide');
            return;
        }

        activeActions[active].command(view.state, view.dispatch, view);
        activeActions[active].$.classList.remove('active');
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
    const { filter } = status.get();

    if (!status.isSlash()) {
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

    dropdownElement.classList.remove('hide');

    activeList[0].$.classList.add('active');
    requestAnimationFrame(() => {
        scrollIntoView(activeList[0].$, {
            scrollMode: 'if-needed',
            block: 'nearest',
            inline: 'nearest',
        });
    });

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
    const wrapper = view.dom.parentNode;
    if (!wrapper) return {};

    const dropdownElement = createDropdown(ctx);
    const mouseManager = createMouseManager();
    wrapper.appendChild(dropdownElement);

    const _mouseMove = handleMouseMove(mouseManager);
    const _mouseDown = handleClick(status, items, view, dropdownElement);
    const _keydown = handleKeydown(status, view, dropdownElement, mouseManager);
    const _mouseEnter = handleMouseEnter(status, mouseManager);
    const _mouseLeave = handleMouseLeave();

    items
        .filter((item) => item.enable(view.state.schema))
        .forEach(({ $ }) => {
            $.addEventListener('mouseenter', _mouseEnter);
            $.addEventListener('mouseleave', _mouseLeave);
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
