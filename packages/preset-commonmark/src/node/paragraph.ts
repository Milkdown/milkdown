/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { setBlockType } from '@milkdown/prose/commands';
import { createNode, createShortcut } from '@milkdown/utils';
import { visit } from 'unist-util-visit';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Text'];

export const TurnIntoText = createCmdKey('TurnIntoText');

function remarkSpace() {
    function transformer(tree: any) {
        visit(tree, 'text', function (node, index, parent) {
            const content = node.value;
            if (content === '\\') {
                parent.children.splice(index, 1);
                return;
            }
            return node;
        });
    }
    return transformer;
}

const id = 'paragraph';
export type ParagraphOptions = {
    keepEmptyLine?: boolean;
};
export const paragraph = createNode<Keys, ParagraphOptions>((utils, options = {}) => {
    return {
        id,
        schema: () => ({
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'p' }],
            toDOM: (node) => ['p', { class: utils.getClassName(node.attrs, id) }, 0],
            parseMarkdown: {
                match: (node) => node.type === 'paragraph',
                runner: (state, node, type) => {
                    state.openNode(type);
                    if (node.children) {
                        state.next(node.children);
                    } else {
                        state.addText(node['value'] as string);
                    }
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === 'paragraph',
                runner: (state, node) => {
                    state.openNode('paragraph');
                    if (options.keepEmptyLine && node.childCount === 0) {
                        state.addNode('text', undefined, undefined, {
                            value: '\\',
                        });
                    } else {
                        const onlyHardbreak = node.childCount === 1 && node.firstChild?.type.name === 'hardbreak';
                        if (!onlyHardbreak) {
                            state.next(node.content);
                        }
                    }
                    state.closeNode();
                },
            },
        }),
        commands: (nodeType) => [createCmd(TurnIntoText, () => setBlockType(nodeType))],
        shortcuts: {
            [SupportedKeys.Text]: createShortcut(TurnIntoText, 'Mod-Alt-0'),
        },
        remarkPlugins: () => (options.keepEmptyLine ? [remarkSpace] : []),
    };
});
