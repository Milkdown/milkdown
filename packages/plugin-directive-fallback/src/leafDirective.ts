/* Copyright 2021, Milkdown by Mirone. */
// import { SupportedKeys } from '@milkdown/preset-commonmark';
import { NodeType } from '@milkdown/prose/model';
import { createNode } from '@milkdown/utils';

// type Keys = SupportedKeys['notice'];
import { attributesToString } from './utils';

const id = 'directiveLeafFallback';

export const directiveLeafNode = createNode(() => {
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
            content: 'block',
            group: 'block',
            parseMarkdown: {
                match: ({ type }) => type === 'leafDirective',
                runner: (state, node) => {
                    state.openNode(state.schema.nodes['paragraph'] as NodeType);
                    state.addText(
                        `::${node['name']}${attributesToString(
                            node['attributes'] as Record<string, string>,
                            node.children,
                            true,
                        )}`,
                    );
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
