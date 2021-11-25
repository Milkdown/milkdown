/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/core';
import { Decoration, DecorationSet, EditorState, EditorView, findParentNode } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import type { Status } from './status';

export type Props = ReturnType<typeof createProps>;

const createEmptyStyle = ({ font, palette }: ThemeTool) => css`
    position: relative;
    &::before {
        position: absolute;
        cursor: text;
        font-family: ${font.typography};
        font-size: 0.875rem;
        color: ${palette('neutral', 0.6)};
        content: attr(data-text);
        height: 100%;
        display: flex;
        align-items: center;
    }
`;

const createSlashStyle = () => css`
    &::before {
        left: 0.5rem;
    }
`;

export const createProps = (status: Status, utils: Utils) => {
    const emptyStyle = utils.getStyle(createEmptyStyle);
    const slashStyle = utils.getStyle(createSlashStyle);

    return {
        handleKeyDown: (_: EditorView, event: Event) => {
            if (status.isEmpty()) {
                return false;
            }
            if (!(event instanceof KeyboardEvent)) {
                return false;
            }

            if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
                return false;
            }

            return true;
        },
        decorations: (state: EditorState) => {
            const paragraph = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);

            if (
                !paragraph ||
                paragraph.node.childCount > 1 ||
                state.selection.$from.parentOffset !== paragraph.node.textContent.length
            ) {
                status.clear();
                return;
            }

            const { placeholder, actions } = status.update({
                parentNode: state.selection.$from.node(state.selection.$from.depth - 1),
                isTopLevel: state.selection.$from.depth === 1,
                content: paragraph.node.textContent,
                state,
            });

            if (!placeholder) {
                return null;
            }

            const createDecoration = (text: string, className: (string | undefined)[]) => {
                const pos = paragraph.pos;
                return DecorationSet.create(state.doc, [
                    Decoration.node(pos, pos + paragraph.node.nodeSize, {
                        class: className.filter((x) => x).join(' '),
                        'data-text': text,
                    }),
                ]);
            };

            if (actions.length) {
                return createDecoration(placeholder, [emptyStyle, slashStyle, 'empty-node', 'is-slash']);
            }

            return createDecoration(placeholder, [emptyStyle, 'empty-node']);
        },
    };
};
