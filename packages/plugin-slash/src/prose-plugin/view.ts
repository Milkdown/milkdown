/* Copyright 2021, Milkdown by Mirone. */
import { missingRootElement } from '@milkdown/exception';
import { calculateNodePosition } from '@milkdown/prose';
import { EditorView } from '@milkdown/prose/view';
import { ThemeUtils } from '@milkdown/utils';

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

export const defaultCalcPosition = (view: EditorView, dropdownElement: HTMLElement) => {
    calculateNodePosition(view, dropdownElement, (selected, target, parent) => {
        const $editor = dropdownElement.parentElement;
        if (!$editor) {
            throw missingRootElement();
        }

        let left = selected.left - parent.left;

        if (left < 0) {
            left = 0;
        }

        let direction: 'top' | 'bottom';
        let maxHeight: number | undefined;
        const selectedToTop = selected.top - parent.top;
        const selectedToBottom = parent.height + parent.top - selected.bottom;
        if (selectedToBottom >= target.height + 28) {
            direction = 'bottom';
        } else if (selectedToTop >= target.height + 28) {
            direction = 'top';
        } else if (selectedToBottom >= selectedToTop) {
            direction = 'bottom';
            maxHeight = selectedToBottom - 28;
        } else {
            direction = 'top';
            maxHeight = selectedToTop - 28;
        }
        if (selectedToTop < 0 || selectedToBottom < 0) {
            maxHeight = parent.height - selected.height - 28;
            if (maxHeight > target.height) {
                maxHeight = undefined;
            }
        }

        const top =
            direction === 'top'
                ? selected.top - parent.top - (maxHeight ?? target.height) - 14 + $editor.scrollTop
                : selected.bottom - parent.top + 14 + $editor.scrollTop;

        dropdownElement.style.maxHeight = maxHeight !== undefined && maxHeight > 0 ? `${maxHeight}px` : '';

        return [top, left];
    });
};

export type CalcPosition = (view: EditorView, dropdownElement: HTMLElement) => void;

export const createView = (
    status: Status,
    view: EditorView,
    utils: ThemeUtils,
    className: string,
    calcPosition: CalcPosition,
) => {
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

            calcPosition(view, dropdownElement);
        },

        destroy: () => {
            wrapper.removeEventListener('mousemove', _mouseMove);
            wrapper.removeEventListener('mousedown', _mouseDown);
            wrapper.removeEventListener('keydown', _keydown);
            dropdownElement.remove();
        },
    };
};
