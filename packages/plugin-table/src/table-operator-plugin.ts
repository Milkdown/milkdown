import { EditorState, Plugin, PluginKey, PluginSpec, Transaction } from 'prosemirror-state';
import {
    addColumnAfter,
    addColumnBefore,
    CellSelection,
    deleteColumn,
    deleteRow,
    deleteTable,
    setCellAttr,
    TableMap,
    isInTable,
    selectedRect,
} from 'prosemirror-tables';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { addRowWithAlignment, CellPos, getCellsInColumn, getCellsInRow, selectLine, selectTable } from './utils';

export const key = 'MILKDOWN_PLUGIN_TABLE';

enum ToolTipPos {
    Left = 'Left',
    Top = 'Top',
    Point = 'Point',
}

export type Item = {
    $: HTMLElement;
    command: (e: Event, view: EditorView) => (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
    disable?: (view: EditorView) => boolean;
};

export enum Action {
    AddColLeft,
    AddColRight,
    AddRowTop,
    AddRowBottom,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Delete,
}

function icon(text: string) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'icon material-icons material-icons-outlined';
    return span;
}

const getCellSelection = (view: EditorView): CellSelection => view.state.selection as unknown as CellSelection;

export const isFirstRowSelected = (selection: CellSelection) => {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    const start = selection.$anchorCell.start(-1);
    const cells = map.cellsInRect({
        left: 0,
        right: map.width,
        top: 0,
        bottom: 1,
    });
    const selectedCells = map.cellsInRect(
        map.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start),
    );

    for (let i = 0, count = cells.length; i < count; i++) {
        if (selectedCells.indexOf(cells[i]) === -1) {
            return false;
        }
    }
    return true;
};

export class PluginProps implements PluginSpec {
    #decorations: Decoration[] = [];
    #tooltip: HTMLDivElement;
    #view?: EditorView;
    #items: Record<Action, Item> = {
        [Action.AddColLeft]: {
            $: icon('chevron_left'),
            command: () => addColumnBefore,
            disable: (view) => !getCellSelection(view).isColSelection(),
        },
        [Action.AddColRight]: {
            $: icon('chevron_right'),
            command: () => addColumnAfter,
            disable: (view) => !getCellSelection(view).isColSelection(),
        },
        [Action.AddRowTop]: {
            $: icon('expand_less'),
            command: () => (state, dispatch) => {
                if (!isInTable(state)) return false;
                if (dispatch) {
                    const rect = selectedRect(state);
                    dispatch(addRowWithAlignment(state.tr, rect, rect.top));
                }
                return true;
            },
            disable: (view) =>
                !getCellSelection(view).isRowSelection() ||
                getCellSelection(view).$head.parent.type.name === 'table_header',
        },
        [Action.AddRowBottom]: {
            $: icon('expand_more'),
            command: () => (state, dispatch) => {
                if (!isInTable(state)) return false;
                if (dispatch) {
                    const rect = selectedRect(state);
                    dispatch(addRowWithAlignment(state.tr, rect, rect.bottom));
                }
                return true;
            },
            disable: (view) => !getCellSelection(view).isRowSelection(),
        },
        [Action.AlignLeft]: {
            $: icon('format_align_left'),
            command: () => setCellAttr('alignment', 'left'),
            disable: (view) => !getCellSelection(view).isColSelection(),
        },
        [Action.AlignCenter]: {
            $: icon('format_align_center'),
            command: () => setCellAttr('alignment', 'center'),
            disable: (view) => !getCellSelection(view).isColSelection(),
        },
        [Action.AlignRight]: {
            $: icon('format_align_right'),
            command: () => setCellAttr('alignment', 'right'),
            disable: (view) => !getCellSelection(view).isColSelection(),
        },
        [Action.Delete]: {
            $: icon('delete'),
            command: (_, view) => {
                const selection = getCellSelection(view);
                const isCol = selection.isColSelection();
                const isRow = selection.isRowSelection();
                if (isCol && isRow) {
                    return deleteTable;
                }

                if (isCol) {
                    return deleteColumn;
                }

                return deleteRow;
            },
            disable: (view) => {
                const selection = getCellSelection(view);
                if (selection.isRowSelection()) {
                    if (selection.isColSelection()) {
                        return false;
                    }
                    return isFirstRowSelected(selection);
                }
                return false;
            },
        },
    };

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

        const isCellSelection = state.selection instanceof CellSelection;

        if (!isCellSelection || !view.editable) {
            this.hide();
            return;
        }

        this.calculateItem(view);
        if (Object.values(this.#items).every(({ $ }) => $.classList.contains('hide'))) {
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
        Object.values(this.#items).forEach(({ $ }) => this.#tooltip.appendChild($));
        editorView.dom.parentNode?.appendChild(this.#tooltip);
        this.update(editorView);
        this.#tooltip.addEventListener('mousedown', this.listener);
        return {
            update: this.update,
            destroy: () => {
                this.#tooltip.removeEventListener('mousedown', this.listener);
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
                if (!this.#view) return;

                e.preventDefault();
                switch (pos) {
                    case ToolTipPos.Point: {
                        this.#view.dispatch(selectTable(this.#view.state.tr));
                        return;
                    }
                    case ToolTipPos.Left: {
                        this.#view.dispatch(selectLine('row')(index)(this.#view.state.tr));
                        return;
                    }
                    case ToolTipPos.Top: {
                        this.#view.dispatch(selectLine('col')(index)(this.#view.state.tr));
                        return;
                    }
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
        const selection = view.state.selection as unknown as CellSelection;

        const isCol = selection.isColSelection();
        const isRow = selection.isRowSelection();

        const { from } = selection;
        const bound = this.#tooltip.getBoundingClientRect();

        const node = view.domAtPos(from).node as HTMLElement;
        const rect = node.getBoundingClientRect();

        let leftPx = !isRow ? rect.left + (rect.width - bound.width) / 2 : rect.left - bound.width / 2 - 8;
        let topPx = rect.top - bound.height - (isCol ? 18 : 4);

        if (leftPx < 0) {
            leftPx = 0;
        }
        if (topPx < bound.height) {
            topPx = rect.top;
        }

        this.#tooltip.style.left = leftPx + 'px';
        this.#tooltip.style.top = topPx + 'px';
    }

    private calculateItem(view: EditorView) {
        Object.values(this.#items).forEach((item) => {
            const disable = item.disable?.(view);
            if (disable) {
                item.$.classList.add('hide');
                return;
            }
            item.$.classList.remove('hide');
        });
    }

    private hide() {
        this.#tooltip.classList.add('hide');
    }

    private listener = (e: Event) => {
        const view = this.#view;
        if (!view) return;
        e.stopPropagation();
        e.preventDefault();
        Object.values(this.#items).forEach(({ $, command }) => {
            if ($.contains(e.target as Element)) {
                command(e, view)(view.state, view.dispatch);
            }
        });
    };
}

export const tableOperatorPlugin = () => new Plugin(new PluginProps());
