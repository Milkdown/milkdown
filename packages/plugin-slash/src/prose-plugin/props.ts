/* Copyright 2021, Milkdown by Mirone. */
import { Color, Emotion, ThemeColor, ThemeFont, ThemeManager } from '@milkdown/core';
import { findParentNode } from '@milkdown/prose';
import { EditorState } from '@milkdown/prose/state';
import { Decoration, DecorationSet, EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

import type { Status } from './status';

export type Props = ReturnType<typeof createProps>;

const createEmptyStyle = (themeManager: ThemeManager, { css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
    const typography = themeManager.get(ThemeFont, 'typography');

    return css`
        position: relative;
        &::before {
            position: absolute;
            cursor: text;
            font-family: ${typography};
            font-size: 0.875em;
            color: ${palette('neutral', 0.6)};
            content: attr(data-text);
            height: 100%;
            display: flex;
            align-items: center;
        }
    `;
};

const createSlashStyle = (_: ThemeManager, { css }: Emotion) => css`
    &::before {
        left: 0.5em;
    }
`;

export const createProps = (status: Status, utils: Utils) => {
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
            const uploadPlugin = state.plugins.find(
                (x) => (x as unknown as { key: string }).key === 'MILKDOWN_UPLOAD$',
            );
            const decorations: DecorationSet = uploadPlugin?.getState(state);
            if (decorations != null && decorations.find(state.selection.from, state.selection.to).length > 0) {
                status.clear();
                return null;
            }

            if (
                !paragraph ||
                paragraph.node.childCount > 1 ||
                state.selection.$from.parentOffset !== paragraph.node.textContent.length ||
                (paragraph.node.firstChild && paragraph.node.firstChild.type.name !== 'text')
            ) {
                status.clear();
                return null;
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

            const emptyStyle = utils.getStyle((emotion) => createEmptyStyle(utils.themeManager, emotion));
            const slashStyle = utils.getStyle((emotion) => createSlashStyle(utils.themeManager, emotion));

            if (actions.length) {
                return createDecoration(placeholder, [emptyStyle, slashStyle, 'empty-node', 'is-slash']);
            }

            return createDecoration(placeholder, [emptyStyle, 'empty-node']);
        },
    };
};
