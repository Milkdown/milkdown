/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/core';
import { Decoration, DecorationSet, EditorState, EditorView, findParentNode } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { transformAction } from '../item';
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

export const createProps = (status: Status, utils: Utils) => {
    const emptyStyle = utils.getStyle(createEmptyStyle);
    const slashStyle = utils.getStyle(createSlashStyle);

    return {
        handleKeyDown: (_: EditorView, event: Event) => {
            const { cursorStatus, actions } = status.get();
            if (cursorStatus === CursorStatus.Empty || actions.length === 0) {
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

            const isEmpty = parent.node.content.size === 0;

            if (isEmpty) {
                status.setActions([]);
                const text = 'AAA';
                return createDecoration(text, [emptyStyle, 'empty-node']);
            }

            const config = status.configurations.find(
                (cfg) =>
                    cfg.prefix &&
                    parent.node.textContent.startsWith(cfg.prefix) &&
                    state.selection.$from.parentOffset > cfg.prefix.length - 1,
            );

            if (config && config.prefix) {
                let actions = (config.actions ? config.actions({ state }) : []).map((action) =>
                    transformAction(action),
                );
                if (state.selection.$from.parentOffset > config.prefix.length) {
                    const filter = parent.node.textContent.slice(1);
                    actions = actions.filter((action) =>
                        action.keyword.some((key) => key.includes(filter.toLocaleLowerCase())),
                    );
                    status.setActions(actions);
                    return null;
                } else {
                    status.setActions(actions);
                    return createDecoration(config.placeholder, [emptyStyle, slashStyle, 'empty-node', 'is-slash']);
                }
            }

            return null;
        },
    };
};
