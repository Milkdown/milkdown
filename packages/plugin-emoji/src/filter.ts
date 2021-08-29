/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { Ctx, prosePluginFactory, themeToolCtx } from '@milkdown/core';
import { calculateNodePosition } from '@milkdown/utils';
import { Emoji, search } from 'node-emoji';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { full, part } from './constant';
import { parse } from './parse';

const checkTrigger = (
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
    const textBefore =
        $from.parent.textBetween(Math.max(0, $from.parentOffset - 10), $from.parentOffset, undefined, '\ufffc') + text;
    if (full.test(textBefore)) {
        return false;
    }
    const regex = part.exec(textBefore);
    if (regex && textBefore.endsWith(regex[0])) {
        const match = regex[0];
        setRange(from - (match.length - text.length), to);
        setSearch(match);
        return true;
    }
    return false;
};

const renderDropdownList = (
    list: Emoji[],
    dropDown: HTMLElement,
    $active: HTMLElement | null,
    onConfirm: () => void,
    setActive: (active: HTMLElement | null) => void,
) => {
    dropDown.innerHTML = '';
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

        container.addEventListener('mouseenter', (e) => {
            if ($active) {
                $active.classList.remove('active');
            }
            const { target } = e;
            if (!(target instanceof HTMLElement)) return;
            target.classList.add('active');
            setActive(target);
        });
        container.addEventListener('mouseleave', (e) => {
            const { target } = e;
            if (!(target instanceof HTMLElement)) return;
            target.classList.remove('active');
        });
        container.addEventListener('mousedown', (e) => {
            onConfirm();
            e.preventDefault();
        });
    });
};

const filterPlugin = (ctx: Ctx) => {
    let trigger = false;
    let _from = 0;
    let _search = '';
    let $active: null | HTMLElement = null;

    const off = () => {
        trigger = false;
        _from = 0;
        _search = '';
        $active = null;
    };

    return new Plugin({
        props: {
            handleKeyDown(_, event) {
                if (['Delete', 'Backspace'].includes(event.key)) {
                    _search = _search.slice(0, -1);
                    if (_search.length <= 1) {
                        off();
                    }
                    return false;
                }
                if (!trigger) return false;
                if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
                    return false;
                }
                return true;
            },
            handleTextInput(view, from, to, text) {
                trigger = checkTrigger(
                    view,
                    from,
                    to,
                    text,
                    (from) => {
                        _from = from;
                    },
                    (search) => {
                        _search = search;
                    },
                );
                if (!trigger) {
                    off();
                }
                return false;
            },
        },
        view: (editorView) => {
            const { parentNode } = editorView.dom;
            if (!parentNode) {
                throw new Error();
            }

            const dropDown = document.createElement('div');
            const { size, widget, palette, font } = ctx.get(themeToolCtx);
            const style = css`
                position: absolute;
                &.hide {
                    display: none;
                }

                ${widget.border?.()};
                border-radius: ${size.radius};
                background: ${palette('surface')};
                ${widget.shadow?.()};

                .milkdown-emoji-filter_item {
                    display: flex;
                    gap: 0.5rem;
                    height: 2.25rem;
                    padding: 0 1rem;
                    align-items: center;
                    justify-content: flex-start;
                    cursor: pointer;
                    line-height: 2;
                    font-family: ${font.font};
                    font-size: 0.875rem;
                    &.active {
                        background: ${palette('secondary', 0.12)};
                        color: ${palette('primary')};
                    }
                }

                .emoji {
                    height: 1em;
                    width: 1em;
                    margin: 0 0.05em 0 0.1em;
                    vertical-align: -0.1em;
                }
            `;
            dropDown.classList.add('milkdown-emoji-filter', style, 'hide');

            const replace = () => {
                if (!$active) return;

                const { tr } = editorView.state;
                const node = editorView.state.schema.node('emoji', { html: $active.firstElementChild?.innerHTML });

                editorView.dispatch(tr.delete(_from, _from + _search.length).insert(_from, node));
                off();
                dropDown.classList.add('hide');
            };

            parentNode.appendChild(dropDown);
            parentNode.addEventListener('keydown', (e) => {
                if (!trigger || !(e instanceof KeyboardEvent)) return;

                const { key } = e;

                if (key === 'Enter') {
                    replace();
                    return;
                }

                if (['ArrowDown', 'ArrowUp'].includes(key)) {
                    const next =
                        key === 'ArrowDown'
                            ? $active?.nextElementSibling || dropDown.firstElementChild
                            : $active?.previousElementSibling || dropDown.lastElementChild;
                    if ($active) {
                        $active.classList.remove('active');
                    }
                    if (!next) return;
                    next.classList.add('active');
                    $active = next as HTMLElement;

                    return;
                }
            });
            parentNode.addEventListener('mousedown', (e) => {
                if (!trigger) return;

                e.stopPropagation();
                off();
                dropDown.classList.add('hide');
            });

            return {
                update: (view) => {
                    if (!trigger) {
                        dropDown.classList.add('hide');
                        return null;
                    }
                    const result = search(_search).slice(0, 5);
                    const { node } = view.domAtPos(_from);
                    if (result.length === 0 || !node) {
                        dropDown.classList.add('hide');
                        return null;
                    }

                    dropDown.classList.remove('hide');
                    renderDropdownList(result, dropDown, $active, replace, (a) => {
                        $active = a;
                    });
                    calculateNodePosition(view, dropDown, (selected, target, parent) => {
                        const start = view.coordsAtPos(_from);
                        let left = start.left - parent.left;
                        let top = selected.bottom - parent.top + 14;

                        if (left < 0) {
                            left = 0;
                        }

                        if (window.innerHeight - start.bottom < target.height) {
                            top = selected.top - parent.top - target.height - 14;
                        }
                        return [top, left];
                    });

                    return null;
                },
            };
        },
    });
};

export const filter = prosePluginFactory((ctx) => filterPlugin(ctx));
