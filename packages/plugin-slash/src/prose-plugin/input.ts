/* Copyright 2021, Milkdown by Mirone. */

import { EditorView } from '@milkdown/prose';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { Action } from '../item';
import { Status } from './status';

export const createMouseManager = () => {
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
export type MouseManager = ReturnType<typeof createMouseManager>;

export const handleMouseMove = (mouseManager: MouseManager) => () => {
    mouseManager.unlock();
};

export const handleMouseEnter = (status: Status, mouseManager: MouseManager) => (e: MouseEvent) => {
    if (mouseManager.isLock()) return;
    const active = status.get().activeActions.findIndex((x) => x.$.classList.contains('active'));
    if (active >= 0) {
        status.get().activeActions[active].$.classList.remove('active');
    }
    const { target } = e;
    if (!(target instanceof HTMLElement)) return;
    target.classList.add('active');
};

export const handleMouseLeave = () => (e: MouseEvent) => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) return;
    target.classList.remove('active');
};

export const handleClick =
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

export const handleKeydown =
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
