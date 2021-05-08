import { EditorState, Plugin, PluginKey, PluginSpec } from 'prosemirror-state';
import { CellSelection } from 'prosemirror-tables';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { CellPos, getCellsInColumn, getCellsInRow, select, selectTable } from './utils';

export const key = 'MILKDOWN_PLUGIN_TABLE';

enum ToolTipPos {
    Left = 'Left',
    Top = 'Top',
    Point = 'Point',
}

export class PluginProps implements PluginSpec {
    #decorations: Decoration[] = [];
    #tooltip: HTMLDivElement;
    #view?: EditorView;

    key = new PluginKey('TABLE_OP');

    constructor() {
        this.#tooltip = document.createElement('div');
        this.#tooltip.classList.add('table-tooltip');
    }

    decorations = (state: EditorState) => {
        const leftCells = getCellsInColumn(0)(state.selection);
        if (!leftCells) return null;
        const topCells = getCellsInRow(0)(state.selection);
        if (!topCells) return null;

        const [topLeft] = leftCells;

        this.createWidget(topLeft, ToolTipPos.Point);
        leftCells.forEach((cell, i) => {
            this.createWidget(cell, ToolTipPos.Left, i);
        });
        topCells.forEach((cell, i) => {
            this.createWidget(cell, ToolTipPos.Top, i);
        });

        return DecorationSet.create(state.doc, this.#decorations);
    };

    update = (view: EditorView, prevState?: EditorState) => {
        const state = view.state;

        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

        if (!(state.selection instanceof CellSelection)) {
            this.hide();
            return;
        }

        this.#tooltip.classList.remove('hide');
        this.calculatePosition(view);
    };

    props = {
        decorations: this.decorations,
    };

    view = (editorView: EditorView) => {
        this.#view = editorView;
        editorView.dom.parentNode?.appendChild(this.#tooltip);
        this.update(editorView);
        return {
            update: this.update,
            destroy: () => {
                this.#tooltip.remove();
            },
        };
    };

    private createWidget(cell: CellPos, pos: ToolTipPos.Point): void;
    private createWidget(cell: CellPos, pos: ToolTipPos.Left, index: number): void;
    private createWidget(cell: CellPos, pos: ToolTipPos.Top, index: number): void;
    private createWidget(cell: CellPos, pos: ToolTipPos, index = 0) {
        const widget = Decoration.widget(cell.pos + 1, () => {
            const div = document.createElement('div');
            div.classList.add(this.calculateClassName(pos));
            div.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (!this.#view) return;

                if (pos === ToolTipPos.Point) {
                    this.#view.dispatch(selectTable(this.#view.state.tr));
                    return;
                }

                if (pos === ToolTipPos.Left) {
                    this.#view.dispatch(select('row')(index)(this.#view.state.tr));
                    return;
                }

                if (pos === ToolTipPos.Top) {
                    this.#view.dispatch(select('col')(index)(this.#view.state.tr));
                    return;
                }
            });
            return div;
        });
        this.#decorations.push(widget);
    }

    private calculateClassName(pos: ToolTipPos) {
        switch (pos) {
            case ToolTipPos.Left: {
                return 'milkdown-cell-left';
            }
            case ToolTipPos.Top: {
                return 'milkdown-cell-top';
            }
            case ToolTipPos.Point: {
                return 'milkdown-cell-point';
            }
            default: {
                throw new Error();
            }
        }
    }

    private calculatePosition(view: EditorView) {
        const selection = (view.state.selection as unknown) as CellSelection;

        const isCol = selection.isColSelection();
        const isRow = selection.isRowSelection();
        const isAll = isCol && isRow;

        if (!isCol && !isRow) return;

        const { from, to } = selection;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const left = Math.max((start.left + end.left) / 2, start.left + 3);

        const box = this.#tooltip.offsetParent?.getBoundingClientRect();
        if (!box) return;

        const leftPx =
            left -
            box.left -
            (isRow ? 23 : -(view.domAtPos(from).node as HTMLElement).getBoundingClientRect().width / 2 + 16);
        const bottomPx = box.bottom - start.top + (isAll ? 22 : isCol ? 20 : 4);

        this.#tooltip.style.left = leftPx + 'px';
        this.#tooltip.style.bottom = bottomPx + 'px';
    }

    private hide() {
        this.#tooltip.classList.add('hide');
    }
}

export const tableOperatorPlugin = () => new Plugin(new PluginProps());
