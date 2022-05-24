/* Copyright 2021, Milkdown by Mirone. */

import { EditorView } from '@milkdown/prose/view';
import type { Emoji } from 'node-emoji';

import { full, part } from '../constant';
import { parse } from '../parse';

export const checkTrigger = (
    view: EditorView,
    from: number,
    to: number,
    text: string,
    setRange: (from: number, to: number) => void,
    setSearch: (words: string) => void,
) => {
    if (view.composing) return false;
    const { state } = view;
    const $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) return false;
    const textBefore = (
        $from.parent.textBetween(Math.max(0, $from.parentOffset - 10), $from.parentOffset, undefined, '\ufffc') + text
    ).toLowerCase();
    if (full.test(textBefore)) {
        return false;
    }
    const regex = part.exec(textBefore);
    if (regex && regex[0] && textBefore.endsWith(regex[0])) {
        const match = regex[0];
        setRange(from - (match.length - text.length), to);
        setSearch(match);
        return true;
    }
    return false;
};

export const renderDropdownList = (
    list: Emoji[],
    dropDown: HTMLElement,
    $active: HTMLElement | null,
    onConfirm: () => void,
    setActive: (active: HTMLElement | null) => void,
) => {
    while (dropDown.firstChild) {
        dropDown.firstChild.remove();
    }
    list.forEach(({ emoji, key }, i) => {
        const container = document.createElement('div');
        container.className = 'milkdown-emoji-filter_item';

        const emojiSpan = document.createElement('span');
        emojiSpan.innerHTML = parse(emoji);

        emojiSpan.className = 'milkdown-emoji-filter_item-emoji';
        const keySpan = document.createElement('span');
        keySpan.textContent = ':' + key + ':';
        keySpan.className = 'milkdown-emoji-filter_item-key';

        container.appendChild(emojiSpan);
        container.appendChild(keySpan);
        dropDown.appendChild(container);

        if (i === 0) {
            container.classList.add('active');
            setActive(container);
        }

        const onEnter = (e: MouseEvent) => {
            if ($active) {
                $active.classList.remove('active');
            }
            const { target } = e;
            if (!(target instanceof HTMLElement)) return;
            target.classList.add('active');
            setActive(target);
        };

        const onLeave = (e: MouseEvent) => {
            const { target } = e;
            if (!(target instanceof HTMLElement)) return;
            target.classList.remove('active');
        };

        const onClick = (e: MouseEvent) => {
            e.preventDefault();
            onConfirm();
        };

        container.addEventListener('mouseenter', onEnter);
        container.addEventListener('mouseleave', onLeave);
        container.addEventListener('mousedown', onClick);
    });
};
