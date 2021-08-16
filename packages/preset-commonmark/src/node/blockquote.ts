import { css } from '@emotion/css';
import { createCmdKey, createCmd } from '@milkdown/core';
import { createNode } from '@milkdown/utils';
import { createShortcut } from '@milkdown/utils';
import { wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Blockquote'];

const id = 'blockquote';

export const WrapInBlockquote = createCmdKey();

export const blockquote = createNode<Keys>((options, utils) => {
    const style = options?.headless
        ? null
        : css`
              padding-left: 1.875rem;
              line-height: 1.75rem;
              border-left: 4px solid rgba(var(--primary), 1);
              * {
                  font-size: 1rem;
                  line-height: 1.5rem;
              }
          `;

    return {
        id,
        schema: {
            content: 'block+',
            group: 'block',
            defining: true,
            parseDOM: [{ tag: 'blockquote' }],
            toDOM: (node) => ['blockquote', { class: utils.getClassName(node.attrs, id, style) }, 0],
        },
        parser: {
            match: ({ type }) => type === id,
            runner: (state, node, type) => {
                state.openNode(type).next(node.children).closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('blockquote').next(node.content).closeNode();
            },
        },
        inputRules: (nodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)],
        commands: (nodeType) => [createCmd(WrapInBlockquote, () => wrapIn(nodeType))],
        shortcuts: {
            [SupportedKeys.Blockquote]: createShortcut(WrapInBlockquote, 'Mod-Shift-b'),
        },
    };
});
