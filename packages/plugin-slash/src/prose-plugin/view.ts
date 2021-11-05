/* Copyright 2021, Milkdown by Mirone. */
import { calculateNodePosition, EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { createDropdown } from '../utility';
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

export const createView = (status: Status, view: EditorView, utils: Utils) => {
    const wrapper = view.dom.parentNode;
    if (!wrapper) return {};

    const dropdownElement = createDropdown(utils);
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
            const { actions } = status.get();

            if (!actions.length) {
                dropdownElement.classList.add('hide');
                return;
            }

            dropdownElement.childNodes.forEach((child) => {
                child.removeEventListener('mouseenter', _mouseEnter as EventListener);
                child.removeEventListener('mouseenter', _mouseLeave as EventListener);
            });

            // Reset dropdownElement children
            dropdownElement.textContent = '';

            actions.forEach(({ $ }) => {
                $.classList.remove('active');
                $.addEventListener('mouseenter', _mouseEnter);
                $.addEventListener('mouseenter', _mouseLeave);
                dropdownElement.appendChild($);
            });

            dropdownElement.classList.remove('hide');
            actions[0].$.classList.add('active');

            requestAnimationFrame(() => {
                scrollIntoView(actions[0].$, {
                    scrollMode: 'if-needed',
                    block: 'nearest',
                    inline: 'nearest',
                });
            });

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
