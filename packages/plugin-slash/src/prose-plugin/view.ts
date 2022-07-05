/* Copyright 2021, Milkdown by Mirone. */
import { missingRootElement } from '@milkdown/exception';
import { calculateNodePosition } from '@milkdown/prose';
import { EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

import { createDropdown } from '../utility';
import { renderDropdown } from './dropdown';
import {
    createMouseManager,
    handleClick,
    handleKeydown,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
} from './input';
import { Status } from './status';

const calculatePosition = (view: EditorView, dropdownElement: HTMLElement) => {
    calculateNodePosition(view, dropdownElement, (selected, target, parent) => {
        const $editor = dropdownElement.parentElement;
        if (!$editor) {
            throw missingRootElement();
        }

        let left = selected.left - parent.left;
        let top = selected.bottom - parent.top + 14 + $editor.scrollTop;

        if (left < 0) {
            left = 0;
        }

        if (parent.height + parent.top - selected.bottom < target.height) {
            const topOffset = selected.top - parent.top - target.height - 14 + $editor.scrollTop;
            if (topOffset > 0) {
                top = topOffset;
            }
        }
        return [top, left];
    });
};

export const createView = (status: Status, view: EditorView, utils: Utils, className: string) => {
    const wrapper = view.dom.parentNode;
    if (!wrapper) return {};

    const dropdownElement = createDropdown(utils, className);
    const mouseManager = createMouseManager();
    wrapper.appendChild(dropdownElement);

    const _mouseMove = handleMouseMove(mouseManager);
    const _mouseDown = handleClick(status, view, dropdownElement);
    const _keydown = handleKeydown(status, view, dropdownElement, mouseManager);
    const _mouseEnter = handleMouseEnter(status, mouseManager);
    const _mouseLeave = handleMouseLeave();

    wrapper.addEventListener('mousemove', _mouseMove);
    wrapper.addEventListener('mousedown', _mouseDown);
    wrapper.addEventListener('keydown', _keydown);

    return {
        update: (view: EditorView) => {
            const show = renderDropdown(status, dropdownElement, {
                mouseEnter: _mouseEnter as EventListener,
                mouseLeave: _mouseLeave as EventListener,
            });

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
