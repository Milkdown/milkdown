/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose';
import { calculateNodePosition, Utils } from '@milkdown/utils';

import { Action } from '../item';
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

export const createView = (status: Status, items: Action[], view: EditorView, utils: Utils) => {
    const wrapper = view.dom.parentNode;
    if (!wrapper) return {};

    const dropdownElement = createDropdown(utils);
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
