import { createNode } from '@milkdown/utils';
import { setBlockType } from 'prosemirror-commands';
import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Text'];

const id = 'paragraph';
export const paragraph = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: (node) => ['p', { class: utils.getClassName(node.attrs, id) }, 0],
    },
    parser: {
        match: (node) => node.type === 'paragraph',
        runner: (state, node, type) => {
            state.openNode(type);
            if (node.children) {
                state.next(node.children);
            } else {
                state.addText(node.value as string);
            }
            state.closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === 'paragraph',
        runner: (state, node) => {
            state.openNode('paragraph');
            state.next(node.content);
            state.closeNode();
        },
    },
    shortcuts: (nodeType) => ({
        [SupportedKeys.Text]: {
            defaultKey: 'Mod-Alt-0',
            command: setBlockType(nodeType),
        },
    }),
}));
