/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/core';
import { Decoration, DecorationSet, EditorState, EditorView, findParentNode } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { CursorConfig } from '..';
import { transformAction } from '../item';
// import { transformAction } from '../item';
import { CursorStatus, Status } from './status';

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

    return {
        handleKeyDown: (_: EditorView, event: Event) => {
            const { cursorStatus, actions } = status.get();
            if (cursorStatus !== CursorStatus.Slash || actions.length === 0) {
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

            if (!parent) {
                status.clearStatus();
                return;
            }

            const createDecoration = (text: string, className: (string | undefined)[]) => {
                const pos = parent.pos;
                return DecorationSet.create(state.doc, [
                    Decoration.node(pos, pos + parent.node.nodeSize, {
                        class: className.filter((x) => x).join(' '),
                        'data-text': text,
                    }),
                ]);
            };

            if (parent.node.content.size === 0) {
                const emptyConfig = cursorConfigs.find((cfg) => !cfg.cursor) || {
                    placeholder: 'Type / to use the slash commands...',
                };

                const shouldDisplay = emptyConfig?.shouldDisplay
                    ? emptyConfig.shouldDisplay(parent, state)
                    : parent.node.childCount <= 1 && state.selection.$from.depth === 1;

                status.clearStatus();

                return shouldDisplay ? createDecoration(emptyConfig.placeholder, [emptyStyle, 'empty-node']) : null;
            }

            const config = cursorConfigs.find((cfg) => cfg.cursor && parent.node.textContent.startsWith(cfg.cursor));

            if (!config || !config.cursor) {
                return null;
            }

            let actions = config.actions ? config.actions(state) : [];

            if (state.selection.$from.parentOffset > config.cursor.length) {
                actions = actions.filter(({ keyword }) =>
                    keyword.some((key) => key.includes(parent.node.textContent.slice(1).toLocaleLowerCase())),
                );
                status.setActions(actions.map(transformAction));
                return null;
            }

            status.setActions(actions.map(transformAction));
            return createDecoration(config.placeholder, [emptyStyle, slashStyle, 'empty-node', 'is-slash']);
        },
    };
};
