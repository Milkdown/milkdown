/* Copyright 2021, Milkdown by Mirone. */
// import { SupportedKeys } from '@milkdown/preset-commonmark';
import { NodeType } from '@milkdown/prose/model';
import { createNode } from '@milkdown/utils';

import { attributesToString } from './utils';
// type Keys = SupportedKeys['notice'];

const id = 'directiveContainerFallback';

export const directiveContainerNode = createNode(() => {
    return {
        id,
        schema: () => ({
            attrs: {
                name: {
                    default: '',
                },
                attrString: {
                    default: '',
                },
            },
            content: 'block+',
            group: 'block',
            parseMarkdown: {
                match: ({ type }) => type === 'containerDirective',
                runner: (state, node) => {
                    state.openNode(state.schema.nodes['paragraph'] as NodeType);
                    state.addText(
                        `:::${node['name']}${attributesToString(
                            node['attributes'] as Record<string, string>,
                            node.children,
                        )}`,
                    );
                    state.closeNode();
                    state.next(node.children);
                    state.openNode(state.schema.nodes['paragraph'] as NodeType);
                    state.addText(':::');
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: () => false,
                runner: () => null,
            },
        }),
    };
});
