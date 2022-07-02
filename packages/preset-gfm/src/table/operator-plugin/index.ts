/* Copyright 2021, Milkdown by Mirone. */

import { Ctx } from '@milkdown/core';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Decoration, DecorationSet } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

import { CellSelection } from '../plugin';
import { CellPos, getCellsInColumn, getCellsInRow } from '../utils';
import { createActions } from './actions';
import { calculatePosition } from './calc-pos';
import { ToolTipPos } from './constant';
import { calculateItem } from './helper';
import { injectStyle } from './style';
import { createWidget } from './widget';

export const key = 'MILKDOWN_TABLE';

export const operatorPlugin = (ctx: Ctx, utils: Utils) => {
    return new Plugin({
        key: new PluginKey('MILKDOWN_TABLE_OP'),
        props: {
            decorations: (state) => {
                const decorations: Decoration[] = [];
                const leftCells = getCellsInColumn(0)(state.selection);
                if (!leftCells) return null;
                const topCells = getCellsInRow(0)(state.selection);
                if (!topCells) return null;

                const [topLeft] = leftCells;

                decorations.push(createWidget(ctx, topLeft as CellPos, ToolTipPos.Point));
                leftCells.forEach((cell, i) => {
                    decorations.push(createWidget(ctx, cell, ToolTipPos.Left, i));
                });
                topCells.forEach((cell, i) => {
                    decorations.push(createWidget(ctx, cell, ToolTipPos.Top, i));
                });

                return DecorationSet.create(state.doc, decorations);
            },
        },
        view: (editorView) => {
            const items = Object.fromEntries(Object.entries(createActions(ctx)).filter(([, value]) => value.$ != null));
            const tooltip = document.createElement('div');
            utils.themeManager.onFlush(() => {
                const style = utils.getStyle((emotion) => injectStyle(utils.themeManager, emotion));
                if (style) {
                    tooltip.classList.add(style);
                }
            });
            tooltip.classList.add('table-tooltip', 'hide');
            Object.values(items).forEach(({ $ }) => tooltip.appendChild($));
            editorView.dom.parentNode?.appendChild(tooltip);

            const listener = (e: Event) => {
                if (!editorView) return;
                e.stopPropagation();
                e.preventDefault();
                Object.values(items).forEach(({ $, command }) => {
                    if ($.contains(e.target as Element)) {
                        command(e, editorView)(editorView.state, editorView.dispatch, editorView);
                    }
                });
            };

            const hide = () => {
                tooltip.classList.add('hide');
            };

            tooltip.addEventListener('mousedown', listener);

            return {
                update: (view, prevState) => {
                    const state = view.state;

                    if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

                    const isCellSelection = state.selection instanceof CellSelection;

                    if (!isCellSelection || !view.editable) {
                        hide();
                        return;
                    }

                    calculateItem(items, view);
                    if (Object.values(items).every(({ $ }) => $.classList.contains('hide'))) {
                        hide();
                        return;
                    }
                    tooltip.classList.remove('hide');
                    calculatePosition(view, tooltip);
                },
                destroy: () => {
                    tooltip.removeEventListener('mousedown', listener);
                    tooltip.remove();
                },
            };
        },
    });
};
