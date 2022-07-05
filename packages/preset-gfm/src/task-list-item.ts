/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, editorViewCtx, ThemeTaskListItemType } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { wrapIn } from '@milkdown/prose/commands';
import { wrappingInputRule } from '@milkdown/prose/inputrules';
import { liftListItem, sinkListItem, splitListItem } from '@milkdown/prose/schema-list';
import { NodeView } from '@milkdown/prose/view';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from './supported-keys';

type Keys = Extract<keyof SupportedKeys, 'SinkListItem' | 'LiftListItem' | 'NextListItem' | 'TaskList'>;

export const SplitTaskListItem = createCmdKey('SplitTaskListItem');
export const SinkTaskListItem = createCmdKey('SinkTaskListItem');
export const LiftTaskListItem = createCmdKey('LiftTaskListItem');
export const TurnIntoTaskList = createCmdKey('TurnIntoTaskList');

export const taskListItem = createNode<Keys>((utils) => {
    const id = 'task_list_item';

    return {
        id,
        schema: (ctx) => ({
            group: 'listItem',
            content: 'paragraph block*',
            defining: true,
            priority: 60,
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
                            throw expectDomTypeError(dom);
                        }
                        return { checked: dom.dataset['checked'] === 'true' };
                    },
                },
            ],
            toDOM: (node) => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = node.attrs['checked'];
                checkbox.className = utils.getClassName(node.attrs, 'task-list-item_checkbox');
                checkbox.onchange = (event) => {
                    const target = event.target;
                    if (!(target instanceof HTMLInputElement)) return;
                    const view = ctx.get(editorViewCtx);

                    if (!view.editable) {
                        checkbox.checked = !checkbox.checked;

                        return;
                    }

                    const { top, left } = target.getBoundingClientRect();
                    const result = view.posAtCoords({ top, left });
                    if (!result) return;

                    const { tr } = view.state;

                    view.dispatch(
                        tr.setNodeMarkup(result.inside, undefined, {
                            checked: target.checked,
                        }),
                    );
                };
                return [
                    'li',
                    {
                        'data-type': 'task-item',
                        'data-checked': node.attrs['checked'] ? 'true' : 'false',
                        class: utils.getClassName(node.attrs, 'task-list-item'),
                    },
                    checkbox,
                    ['span', { class: utils.getClassName(node.attrs, 'task-list-item_body') }, 0],
                ];
            },
            parseMarkdown: {
                match: ({ type, checked }) => {
                    return type === 'listItem' && checked !== null;
                },
                runner: (state, node, type) => {
                    state.openNode(type, { checked: node['checked'] as boolean });
                    state.next(node.children);
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('listItem', undefined, { checked: node.attrs['checked'] });
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
        view: () => (node, view, getPos) => {
            let currNode = node;

            const renderer = utils.themeManager.get<ThemeTaskListItemType>('task-list-item', {
                editable: () => view.editable,
                onChange: (selected) => {
                    const { tr } = view.state;
                    view.dispatch(
                        tr.setNodeMarkup(getPos(), undefined, {
                            checked: selected,
                        }),
                    );
                },
            });

            if (!renderer) return {} as NodeView;

            const { dom, contentDOM, onUpdate } = renderer;
            onUpdate(currNode);

            return {
                dom,
                contentDOM,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    currNode = updatedNode;
                    onUpdate(currNode);

                    return true;
                },
            };
        },
    };
});
