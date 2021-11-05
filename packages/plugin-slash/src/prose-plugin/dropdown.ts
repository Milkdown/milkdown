/* Copyright 2021, Milkdown by Mirone. */
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { Status } from './status';

type Listeners = {
    mouseEnter: EventListener;
    mouseLeave: EventListener;
};

export const renderDropdown = (status: Status, dropdownElement: HTMLElement, listeners: Listeners): boolean => {
    const { actions } = status.get();

    if (!actions.length) {
        dropdownElement.classList.add('hide');
        return false;
    }

    dropdownElement.childNodes.forEach((child) => {
        child.removeEventListener('mouseenter', listeners.mouseEnter);
        child.removeEventListener('mouseleave', listeners.mouseLeave);
    });

    // Reset dropdownElement children
    dropdownElement.textContent = '';

    actions.forEach(({ $ }) => {
        $.classList.remove('active');
        $.addEventListener('mouseenter', listeners.mouseEnter);
        $.addEventListener('mouseleave', listeners.mouseLeave);
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

    return true;
};
