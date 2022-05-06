/* Copyright 2021, Milkdown by Mirone. */

import { EditorView } from '@milkdown/prose/view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

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
    const { actions } = status.get();
    const active = actions.findIndex((x) => x.$.classList.contains('active'));
    const active$ = actions[active];
    if (active$ && active >= 0) {
        active$.$.classList.remove('active');
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
    (status: Status, view: EditorView, dropdownElement: HTMLElement) =>
    (e: Event): void => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) return;
        if (!view) return;

        const stop = () => {
            e.stopPropagation();
            e.preventDefault();
        };

        const { actions } = status.get();

        const el = Object.values(actions).find(({ $ }) => $.contains(target));
        if (!el) {
            if (status.isEmpty()) return;

            status.clear();
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
        if (status.isEmpty()) return;
        if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(key)) return;

        const { actions } = status.get();

        let active = actions.findIndex(({ $ }) => $.classList.contains('active'));
        if (active < 0) active = 0;

        const moveActive = (next: number) => {
            const active$ = actions[active];
            const next$ = actions[next];
            if (!active$ || !next$) return;
            active$.$.classList.remove('active');
            next$.$.classList.add('active');
            scrollIntoView(next$.$, {
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            });
        };

        if (key === 'ArrowDown') {
            const next = active === actions.length - 1 ? 0 : active + 1;

            moveActive(next);
            return;
        }

        if (key === 'ArrowUp') {
            const next = active === 0 ? actions.length - 1 : active - 1;

            moveActive(next);
            return;
        }

        if (key === 'Escape') {
            if (status.isEmpty()) return;

            status.clear();
            dropdownElement.classList.add('hide');
            return;
        }

        const active$ = actions[active];
        if (!active$) return;
        active$.command(view.state, view.dispatch, view);
        active$.$.classList.remove('active');
    };
