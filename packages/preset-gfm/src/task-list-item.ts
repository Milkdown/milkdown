import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { BaseNode } from '@milkdown/utils';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { SupportedKeys } from '.';

type Keys = SupportedKeys.SinkListItem | SupportedKeys.LiftListItem | SupportedKeys.NextListItem;

export class TaskListItem extends BaseNode<Keys> {
    override readonly id = 'task_list_item';
    override readonly schema: NodeSpec = {
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
                class: this.getClassName(node.attrs, 'task-list-item'),
            },
            0,
        ],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type, checked }) => {
            return type === 'listItem' && checked !== null;
        },
        runner: (state, node, type) => {
            state.openNode(type, { checked: node.checked as boolean });
            state.next(node.children);
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('listItem', undefined, { checked: node.attrs.checked });
            state.next(node.content);
            state.closeNode();
        },
    };
    override readonly inputRules = (nodeType: NodeType) => [
        wrappingInputRule(/^\s*(\[([ |x])\])\s$/, nodeType, (match) => ({
            checked: match[match.length - 1] === 'x',
        })),
    ];
    override readonly view: BaseNode['view'] = (_editor, _nodeType, node, view, getPos) => {
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
            class: this.getClassName(node.attrs, 'task-list-item'),
        };
        Object.entries(attributes).forEach(([key, value]) => {
            listItem.setAttribute(key, value);
        });

        return {
            dom: listItem,
            contentDOM: content,
            update: (updatedNode) => {
                if (updatedNode.type.name !== this.id) return false;

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
    };
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
        [SupportedKeys.NextListItem]: {
            defaultKey: 'Enter',
            command: splitListItem(nodeType),
        },
        [SupportedKeys.SinkListItem]: {
            defaultKey: 'Mod-]',
            command: sinkListItem(nodeType),
        },
        [SupportedKeys.LiftListItem]: {
            defaultKey: 'Mod-[',
            command: liftListItem(nodeType),
        },
    });
}
