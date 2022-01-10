/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { createCmd, createCmdKey, themeToolCtx } from '@milkdown/core';
import type { Icon } from '@milkdown/design-system';
import { liftListItem, sinkListItem, splitListItem, wrapIn, wrappingInputRule } from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from './supported-keys';

type Keys = Extract<keyof SupportedKeys, 'SinkListItem' | 'LiftListItem' | 'NextListItem' | 'TaskList'>;

export const SplitTaskListItem = createCmdKey();
export const SinkTaskListItem = createCmdKey();
export const LiftTaskListItem = createCmdKey();
export const TurnIntoTaskList = createCmdKey();

export const taskListItem = createNode<Keys>((utils) => {
    const id = 'task_list_item';
    const style = utils.getStyle(
        ({ palette, size }) =>
            css`
                list-style-type: none;
                position: relative;

                & > div {
                    overflow: hidden;
                    padding: 0 2px;
                }

                label {
                    position: absolute;
                    top: 0;
                    left: -2rem;
                    display: inline-block;
                    width: 1.5rem;
                    height: 1.5rem;
                    margin: 0.5rem 0;
                    input {
                        visibility: hidden;
                    }
                }
                label:before {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    border-radius: ${size.radius};
                }
                label:hover:before {
                    background: ${palette('background')};
                }
                &[data-checked='true'] {
                    label {
                        color: ${palette('primary')};
                    }
                }
                &[data-checked='false'] {
                    label {
                        color: ${palette('solid', 0.87)};
                    }
                }
                .paragraph {
                    margin: 0.5rem 0;
                }
            `,
    );

    return {
        id,
        schema: () => ({
            group: 'listItem',
            content: 'paragraph block*',
            defining: true,
            attrs: {
                checked: {
                    default: false,
                },
            },
            parseDOM: [
                {
                    tag: 'li[data-type="task-item"]',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return { checked: dom.dataset.checked === 'true' };
                    },
                    priority: 60,
                },
            ],
            toDOM: (node) => [
                'li',
                {
                    'data-type': 'task-item',
                    'data-checked': node.attrs.checked ? 'true' : 'false',
                    class: utils.getClassName(node.attrs, 'task-list-item', style),
                },
                0,
            ],
            parseMarkdown: {
                match: ({ type, checked }) => {
                    return type === 'listItem' && checked !== null;
                },
                runner: (state, node, type) => {
                    state.openNode(type, { checked: node.checked as boolean });
                    state.next(node.children);
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('listItem', undefined, { checked: node.attrs.checked });
                    state.next(node.content);
                    state.closeNode();
                },
            },
        }),
        inputRules: (nodeType) => [
            wrappingInputRule(/^\s*(\[([ |x])\])\s$/, nodeType, (match) => ({
                checked: match[match.length - 1] === 'x',
            })),
        ],
        commands: (nodeType) => [
            createCmd(SplitTaskListItem, () => splitListItem(nodeType)),
            createCmd(SinkTaskListItem, () => sinkListItem(nodeType)),
            createCmd(LiftTaskListItem, () => liftListItem(nodeType)),
            createCmd(TurnIntoTaskList, () => wrapIn(nodeType)),
        ],
        shortcuts: {
            [SupportedKeys.NextListItem]: createShortcut(SplitTaskListItem, 'Enter'),
            [SupportedKeys.SinkListItem]: createShortcut(SinkTaskListItem, 'Mod-]'),
            [SupportedKeys.LiftListItem]: createShortcut(LiftTaskListItem, 'Mod-['),
            [SupportedKeys.TaskList]: createShortcut(TurnIntoTaskList, 'Mod-Alt-9'),
        },
        view: (ctx) => (node, view, getPos) => {
            const createIcon = ctx.get(themeToolCtx).slots.icon;

            const listItem = document.createElement('li');
            const checkboxWrapper = document.createElement('label');
            const checkboxStyler = document.createElement('span');
            const checkbox = document.createElement('input');
            const content = document.createElement('div');

            let icon = createIcon('unchecked');
            checkboxWrapper.appendChild(icon);
            const setIcon = (name: Icon) => {
                const nextIcon = createIcon(name);
                checkboxWrapper.replaceChild(nextIcon, icon);
                icon = nextIcon;
            };

            checkboxWrapper.contentEditable = 'false';
            checkbox.type = 'checkbox';
            const onChange = (event: Event) => {
                const target = event.target;
                if (!(target instanceof HTMLInputElement)) return;

                if (!view.editable) {
                    checkbox.checked = !checkbox.checked;

                    return;
                }

                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        checked: target.checked,
                    }),
                );
            };
            checkbox.addEventListener('change', onChange);

            listItem.dataset.checked = node.attrs.checked;
            if (node.attrs.checked) {
                checkbox.setAttribute('checked', 'checked');
            }

            checkboxWrapper.append(checkbox, checkboxStyler);
            listItem.append(checkboxWrapper, content);

            const attributes = {
                'data-type': 'task-item',
                'data-checked': node.attrs.checked ? 'true' : 'false',
                class: utils.getClassName(node.attrs, 'task-list-item', style),
            };
            Object.entries(attributes).forEach(([key, value]) => {
                listItem.setAttribute(key, value);
            });
            setIcon(node.attrs.checked ? 'checked' : 'unchecked');

            return {
                dom: listItem,
                contentDOM: content,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    listItem.dataset.checked = updatedNode.attrs.checked;
                    if (updatedNode.attrs.checked) {
                        checkbox.setAttribute('checked', 'checked');
                    } else {
                        checkbox.removeAttribute('checked');
                    }
                    setIcon(updatedNode.attrs.checked ? 'checked' : 'unchecked');

                    return true;
                },
                destroy: () => {
                    checkbox.removeEventListener('change', onChange);
                },
            };
        },
    };
});
