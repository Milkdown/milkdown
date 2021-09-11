/* Copyright 2021, Milkdown by Mirone. */
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import { Action } from '../item';
import { Status } from './status';

export const renderDropdown = (status: Status, dropdownElement: HTMLElement, items: Action[]): boolean => {
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
