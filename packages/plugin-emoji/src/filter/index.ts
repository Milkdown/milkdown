/* Copyright 2021, Milkdown by Mirone. */

import { missingRootElement } from '@milkdown/exception';
import { calculateNodePosition } from '@milkdown/prose';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';
import nodeEmoji from 'node-emoji';

import { checkTrigger, renderDropdownList } from './helper';
import { injectStyle } from './style';

export const key = new PluginKey('MILKDOWN_EMOJI_FILTER');

export const filter = (utils: Utils, maxListSize: number) => {
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
        key,
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
                throw missingRootElement();
            }

            const dropDown = document.createElement('div');

            dropDown.classList.add('milkdown-emoji-filter', 'hide');

            utils.themeManager.onFlush(() => {
                const className = dropDown.className
                    .split(' ')
                    .filter((x) => ['hide', 'milkdown-emoji-filter'].includes(x));
                dropDown.className = className.join(' ');
                const style = utils.getStyle((emotion) => injectStyle(utils.themeManager, emotion));
                if (style) {
                    style.split(' ').forEach((x) => dropDown.classList.add(x));
                }
            });

            const replace = () => {
                if (!$active) return;

                const { tr } = editorView.state;
                const node = editorView.state.schema.node('emoji', { html: $active.firstElementChild?.innerHTML });

                editorView.dispatch(tr.delete(_from, _from + _search.length).insert(_from, node));
                off();
                dropDown.classList.add('hide');
            };

            parentNode.appendChild(dropDown);
            const onKeydown = (e: Event) => {
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
            };
            const onClick = (e: Event) => {
                if (!trigger) return;

                e.stopPropagation();
                off();
                dropDown.classList.add('hide');
            };
            parentNode.addEventListener('keydown', onKeydown);
            parentNode.addEventListener('mousedown', onClick);

            return {
                update: (view) => {
                    const { selection } = view.state;

                    if (selection.from - selection.to !== 0 || !trigger) {
                        off();
                        dropDown.classList.add('hide');
                        return null;
                    }
                    const result = nodeEmoji.search(_search).slice(0, maxListSize);
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
                        const $editor = dropDown.parentElement;
                        if (!$editor) {
                            throw missingRootElement();
                        }
                        const start = view.coordsAtPos(_from);
                        let left = start.left - parent.left;
                        let top = selected.bottom - parent.top + 14 + $editor.scrollTop;

                        if (left < 0) {
                            left = 0;
                        }

                        if (window.innerHeight - start.bottom < target.height) {
                            top = selected.top - parent.top - target.height - 14 + $editor.scrollTop;
                        }
                        return [top, left];
                    });

                    return null;
                },

                destroy: () => {
                    parentNode.removeEventListener('keydown', onKeydown);
                    parentNode.removeEventListener('mousedown', onClick);
                    dropDown.remove();
                },
            };
        },
    });
};
