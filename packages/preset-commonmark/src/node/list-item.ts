import { createNode } from '@milkdown/utils';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { SupportedKeys } from '../supported-keys';
import { createCmdKey, createCmd } from '@milkdown/core';
import { createShortcut } from '@milkdown/utils';
import { css } from '@emotion/css';

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem'];

const id = 'list_item';

export const SplitListItem = createCmdKey();
export const SinkListItem = createCmdKey();
export const LiftListItem = createCmdKey();

export const listItem = createNode<Keys>((options, utils) => {
    const style = options?.headless
        ? null
        : css`
              &,
              & > * {
                  margin: 0.5rem 0;
              }

              &,
              li {
                  &::marker {
                      color: ${utils.themeTool.palette('primary')};
                  }
              }
          `;

    return {
        id,
        schema: {
            group: 'listItem',
            content: 'paragraph block*',
            defining: true,
            parseDOM: [{ tag: 'li' }],
            toDOM: (node) => ['li', { class: utils.getClassName(node.attrs, 'list-item', style) }, 0],
        },
        parser: {
            match: ({ type, checked }) => type === 'listItem' && checked === null,
            runner: (state, node, type) => {
                state.openNode(type);
                state.next(node.children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('listItem');
                state.next(node.content);
                state.closeNode();
            },
        },
        inputRules: (nodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
        commands: (nodeType) => [
            createCmd(SplitListItem, () => splitListItem(nodeType)),
            createCmd(SinkListItem, () => sinkListItem(nodeType)),
            createCmd(LiftListItem, () => liftListItem(nodeType)),
        ],
        shortcuts: {
            [SupportedKeys.NextListItem]: createShortcut(SplitListItem, 'Enter'),
            [SupportedKeys.SinkListItem]: createShortcut(SinkListItem, 'Mod-]'),
            [SupportedKeys.LiftListItem]: createShortcut(LiftListItem, 'Mod-['),
        },
    };
});
