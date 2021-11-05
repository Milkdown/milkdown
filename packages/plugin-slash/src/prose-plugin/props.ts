/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/core';
import { Decoration, DecorationSet, EditorState, EditorView, findParentNode } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import type { CursorConfig } from '..';
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

export const createProps = (status: Status, utils: Utils, cursorConfigs: CursorConfig[]) => {
    const emptyStyle = utils.getStyle(createEmptyStyle);
    const slashStyle = utils.getStyle(createSlashStyle);

    // Default: Only display at root level
    const shouldDisplay = (config: CursorConfig, state: EditorState): boolean => {
        const parentNode = state.selection.$from.node(state.selection.$from.depth - 1);
        return config.shouldDisplay ? config.shouldDisplay({ parentNode, state }) : state.selection.$from.depth === 1;
    };

    return {
        handleKeyDown: (_: EditorView, event: Event) => {
            if (status.isEmpty() || status.get().actions.length === 0) {
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

            if (!paragraph || paragraph.node.childCount > 1) {
                status.clear();
                return;
            }

            const cursorOffset = state.selection.$from.parentOffset;
            const cursorText = paragraph.node.textContent;

            const createDecoration = (text: string, className: (string | undefined)[]) => {
                const pos = paragraph.pos;
                return DecorationSet.create(state.doc, [
                    Decoration.node(pos, pos + paragraph.node.nodeSize, {
                        class: className.filter((x) => x).join(' '),
                        'data-text': text,
                    }),
                ]);
            };

            // isEmpty
            if (paragraph.node.content.size === 0) {
                status.clear();

                const emptyConfig = cursorConfigs.find((cfg) => !cfg.cursor) || {
                    placeholder: 'Type / to use the slash commands...',
                };

                return shouldDisplay(emptyConfig, state)
                    ? createDecoration(emptyConfig.placeholder, [emptyStyle, 'empty-node'])
                    : null;
            }

            // Find configuration for current cursorText
            const config = cursorConfigs.find((cfg) => cfg.cursor && cursorText.startsWith(cfg.cursor));

            if (!config || !config.cursor || !shouldDisplay(config, state)) {
                return null;
            }

            const isSlash = cursorOffset === config.cursor.length;
            const isSearch = cursorOffset > config.cursor.length;

            // Get dynamic actions
            const actions = config.actions ? config.actions(state) : [];

            if (isSlash) {
                status.setActions(actions);
                return createDecoration(config.placeholder, [emptyStyle, slashStyle, 'empty-node', 'is-slash']);
            }

            if (isSearch) {
                status.setActions(
                    actions.filter(({ keyword }) =>
                        keyword.some((key) =>
                            key.includes(cursorText.slice(config.cursor?.length).toLocaleLowerCase()),
                        ),
                    ),
                );
            }

            return null;
        },
    };
};
