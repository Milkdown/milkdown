import { createCmdKey, createCmd } from '@milkdown/core';
import { createNode } from '@milkdown/utils';
import { createShortcut } from '@milkdown/utils';
import { wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { SupportedKeys } from '.';

type Keys = Extract<keyof SupportedKeys, 'SinkListItem' | 'LiftListItem' | 'NextListItem' | 'TaskList'>;

export const SplitTaskListItem = createCmdKey();
export const SinkTaskListItem = createCmdKey();
export const LiftTaskListItem = createCmdKey();
export const TurnIntoTaskList = createCmdKey();

export const taskListItem = createNode<Keys>((options, utils) => {
    const id = 'task_list_item';
    return {
        id,
        schema: {
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
                    tag: 'li[data-type="task-list-item"]',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return { checked: dom.dataset.checked === 'true' };
                    },
                },
            ],
            toDOM: (node) => [
                'li',
                {
                    'data-type': 'task-item',
                    'data-checked': node.attrs.checked ? 'true' : 'false',
                    class: utils.getClassName(node.attrs, 'task-list-item'),
                },
                0,
            ],
        },
        parser: {
            match: ({ type, checked }) => {
                return type === 'listItem' && checked !== null;
            },
            runner: (state, node, type) => {
                state.openNode(type, { checked: node.checked as boolean });
                state.next(node.children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('listItem', undefined, { checked: node.attrs.checked });
                state.next(node.content);
                state.closeNode();
            },
        },
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
        view: (editor, nodeType, node, view, getPos, decorations) => {
            if (options?.view) {
                return options.view(editor, nodeType, node, view, getPos, decorations);
            }
            const listItem = document.createElement('li');
            const checkboxWrapper = document.createElement('label');
            const checkboxStyler = document.createElement('span');
            const checkbox = document.createElement('input');
            const content = document.createElement('div');

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
                class: utils.getClassName(node.attrs, 'task-list-item'),
            };
            Object.entries(attributes).forEach(([key, value]) => {
                listItem.setAttribute(key, value);
            });

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

                    return true;
                },
                destroy: () => {
                    checkbox.removeEventListener('change', onChange);
                },
            };
        },
    };
});
