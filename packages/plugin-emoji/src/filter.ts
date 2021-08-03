import { prosePluginFactory } from '@milkdown/core';
import { calculateNodePosition } from '@milkdown/utils';
import { search, Emoji } from 'node-emoji';
import { Plugin } from 'prosemirror-state';
import twemoji from 'twemoji';

const pattern = /:\+1:|:-1:|:[\w-]+/;

const filterPlugin = () => {
    let trigger = false;
    let _from = 0;
    let _to = 0;
    let _search = '';
    let $active: null | HTMLElement = null;

    const plugin = new Plugin({
        props: {
            handleKeyDown(_, event) {
                if (['Delete', 'Backspace'].includes(event.key)) {
                    _search = _search.slice(0, -1);
                    if (_search.length <= 1) {
                        trigger = false;
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
                const checkTrigger = () => {
                    if (view.composing) return false;
                    const { state } = view;
                    const $from = state.doc.resolve(from);
                    if ($from.parent.type.spec.code) return false;
                    const textBefore =
                        $from.parent.textBetween($from.parentOffset - 10, $from.parentOffset, undefined, '\ufffc') +
                        text;
                    const regex = textBefore.match(pattern);
                    if (regex) {
                        const match = regex[0];
                        _from = from - match.length + 1;
                        _to = to + 1;
                        _search = match;
                        return true;
                    }
                    return false;
                };
                trigger = checkTrigger();
                if (!trigger) {
                    _from = 0;
                    _to = 0;
                    _search = '';
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
                $active = null;
                trigger = false;
                _from = 0;
                _to = 0;
                _search = '';
                dropDown.classList.add('hide');
            };

            parentNode.appendChild(dropDown);
            parentNode.addEventListener('keydown', (e) => {
                if (!trigger || !(e instanceof KeyboardEvent)) return;

                const { key } = e;

                if (key === 'ArrowDown') {
                    const next = $active?.nextElementSibling || dropDown.firstElementChild;
                    if ($active) {
                        $active.classList.remove('active');
                    }
                    if (!next) return;
                    next.classList.add('active');
                    $active = next as HTMLElement;

                    return;
                }
                if (key === 'ArrowUp') {
                    const next = $active?.previousElementSibling || dropDown.lastElementChild;
                    if ($active) {
                        $active.classList.remove('active');
                    }
                    if (!next) return;
                    next.classList.add('active');
                    $active = next as HTMLElement;

                    return;
                }
                if (key === 'Enter') {
                    replace();
                }
            });

            const renderDropdownList = (list: Emoji[]) => {
                dropDown.innerHTML = '';
                list.forEach(({ emoji, key }, i) => {
                    const container = document.createElement('div');
                    container.className = 'milkdown-emoji-filter_item';

                    const emojiSpan = document.createElement('span');
                    const html = twemoji.parse(emoji, { attributes: (text) => ({ title: text }) });
                    emojiSpan.innerHTML = html;

                    emojiSpan.className = 'milkdown-emoji-filter_item-emoji';
                    const keySpan = document.createElement('span');
                    keySpan.textContent = ':' + key + ':';
                    keySpan.className = 'milkdown-emoji-filter_item-key';

                    container.appendChild(emojiSpan);
                    container.appendChild(keySpan);
                    dropDown.appendChild(container);

                    if (i === 0) {
                        container.classList.add('active');
                        $active = container;
                    }

                    container.addEventListener('mouseenter', (e) => {
                        if ($active) {
                            $active.classList.remove('active');
                        }
                        const { target } = e;
                        if (!(target instanceof HTMLElement)) return;
                        target.classList.add('active');
                        $active = target;
                    });
                    container.addEventListener('mouseleave', () => {
                        if ($active) {
                            $active.classList.remove('active');
                        }
                    });
                    container.addEventListener('mousedown', (e) => {
                        replace();
                        e.preventDefault();
                    });
                });
            };

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
                    renderDropdownList(result);
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

    return plugin;
};

export const filter = prosePluginFactory(filterPlugin());
