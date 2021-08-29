import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/core';
import { findParentNode, Utils } from '@milkdown/utils';
import { EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { CursorStatus, Status } from './status';

export type Props = ReturnType<typeof createProps>;

const createEmptyStyle = ({ font, palette }: ThemeTool) => css`
    position: relative;
    &::before {
        position: absolute;
        cursor: text;
        font-family: ${font.font};
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
            const { cursorStatus, activeActions } = status.get();
            if (cursorStatus !== CursorStatus.Slash || activeActions.length === 0) {
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
            const parent = findParentNode(({ type }) => type.name === 'paragraph')(state.selection);
            const isTopLevel = state.selection.$from.depth === 1;

            if (!parent || parent.node.childCount > 1 || !isTopLevel) {
                status.clearStatus();
                return;
            }

            const isEmpty = parent.node.content.size === 0;
            const isSlash = parent.node.textContent === '/' && state.selection.$from.parentOffset > 0;
            const isSearch = parent.node.textContent.startsWith('/') && state.selection.$from.parentOffset > 1;

            const createDecoration = (text: string, className: (string | undefined)[]) => {
                const pos = parent.pos;
                return DecorationSet.create(state.doc, [
                    Decoration.node(pos, pos + parent.node.nodeSize, {
                        class: className.filter((x) => x).join(' '),
                        'data-text': text,
                    }),
                ]);
            };

            if (isEmpty) {
                status.clearStatus();
                const text = 'Type / to use the slash commands...';
                return createDecoration(text, [emptyStyle, 'empty-node']);
            }

            if (isSlash) {
                status.setSlash();
                const text = 'Type to filter...';
                return createDecoration(text, [emptyStyle, slashStyle, 'empty-node', 'is-slash']);
            }

            if (isSearch) {
                status.setSlash(parent.node.textContent.slice(1));
                return null;
            }

            status.clearStatus();
            return null;
        },
    };
};
