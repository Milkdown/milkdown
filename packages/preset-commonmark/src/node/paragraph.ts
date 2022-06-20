/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { setBlockType } from '@milkdown/prose/commands';
import { createNode, createShortcut } from '@milkdown/utils';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

import { createTrialing } from '../plugin/trailing';
import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Text'];
interface TextNode extends Node {
    value: string;
}
export const TurnIntoText = createCmdKey('TurnIntoText');

function remarkSpace() {
    function transformer(tree: Node) {
        visit(tree, 'text', function (node: TextNode, index: number, parent: Parent) {
            const content = node?.value;
            if (parent && content === '\\') {
                parent.children.splice(index, 1);
            }
        });
    }
    return transformer;
}

const id = 'paragraph';
export type ParagraphOptions = {
    keepEmptyLine?: boolean;
    autoAppend?: boolean;
};
export const paragraph = createNode<Keys, ParagraphOptions>((utils, options = {}) => {
    return {
        id,
        schema: () => ({
            content: 'inline*',
            group: 'block',
            attrs: {
                auto: {
                    default: false,
                },
            },
            parseDOM: [
                {
                    tag: 'p',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            auto: dom.dataset['auto'] === '1' ? true : false,
                        };
                    },
                },
            ],
            toDOM: (node) => [
                'p',
                {
                    class: utils.getClassName(node.attrs, id),
                    'data-auto': node.attrs['auto'] ? '1' : '0',
                },
                0,
            ],
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
                        if (!node.attrs['auto']) {
                            state.addNode('text', undefined, undefined, {
                                value: '\\',
                            });
                        }
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
        prosePlugins: () => (options.autoAppend ? [createTrialing()] : []),
        remarkPlugins: () => (options.keepEmptyLine ? [remarkSpace] : []),
    };
});
