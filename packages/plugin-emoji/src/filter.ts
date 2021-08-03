import { prosePluginFactory } from '@milkdown/core';
import { calculateNodePosition } from '@milkdown/utils';
import { search, Emoji } from 'node-emoji';
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
        $from.parent.textBetween($from.parentOffset - 10, $from.parentOffset, undefined, '\ufffc') + text;
    if (full.test(textBefore)) {
        return false;
    }
    const regex = textBefore.match(part);
    if (regex) {
        const match = regex[0];
        setRange(from - match.length + 1, to + 1);
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
        container.addEventListener('mouseleave', () => {
            if ($active) {
                $active.classList.remove('active');
            }
        });
        container.addEventListener('mousedown', (e) => {
            onConfirm();
            e.preventDefault();
        });
    });
};

const filterPlugin = () => {
    let trigger = false;
    let _from = 0;
    let _to = 0;
    let _search = '';
    let $active: null | HTMLElement = null;

    const off = () => {
        trigger = false;
        _from = 0;
        _to = 0;
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
                    (from, to) => {
                        _from = from;
                        _to = to;
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
            dropDown.className = 'milkdown-emoji-filter hide';

            const replace = () => {
                if (!$active) return;

                const { tr } = editorView.state;
                const node = editorView.state.schema.node('emoji', { html: $active.firstElementChild?.innerHTML });

                editorView.dispatch(tr.replaceRangeWith(_from, _to, node));
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
                    calculateNodePosition(view, dropDown, (selected, target) => {
                        const start = view.coordsAtPos(_from);
                        let left = start.left;
                        let top = selected.bottom;

                        if (left < 0) {
                            left = 0;
                        }

                        if (window.innerHeight - selected.bottom < target.height) {
                            top = selected.top - target.height;
                        }
                        return [top, left];
                    });

                    return null;
                },
            };
        },
    });
};

export const filter = prosePluginFactory(filterPlugin());
