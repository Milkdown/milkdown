/* Copyright 2021, Milkdown by Mirone. */
import { Node } from '@milkdown/prose/model';
import { NodeView } from '@milkdown/prose/view';

/* Copyright 2021, Milkdown by Mirone. */
export class TableView implements NodeView {
    public dom: HTMLElement;
    public contentDOM: HTMLElement;
    public table: HTMLTableElement;
    public colgroup: HTMLTableColElement;

    constructor(public node: Node, public cellMinWidth: number) {
        this.node = node;
        this.cellMinWidth = cellMinWidth;
        this.dom = document.createElement('div');
        this.dom.className = 'tableWrapper';
        this.table = this.dom.appendChild(document.createElement('table'));
        this.colgroup = this.table.appendChild(document.createElement('colgroup'));
        updateColumns(node, this.colgroup, this.table, cellMinWidth);
        this.contentDOM = this.table.appendChild(document.createElement('tbody'));
    }

    update(node: Node) {
        if (node.type != this.node.type) return false;
        this.node = node;
        updateColumns(node, this.colgroup, this.table, this.cellMinWidth);
        return true;
    }

    ignoreMutation(record: MutationRecord) {
        return record.type == 'attributes' && (record.target == this.table || this.colgroup.contains(record.target));
    }
}

export function updateColumns(
    node: Node,
    colgroup: HTMLTableColElement,
    table: HTMLTableElement,
    cellMinWidth: number,
    overrideCol?: number,
    overrideValue?: number,
) {
    let totalWidth = 0,
        fixedWidth = true;
    let nextDOM = colgroup.firstChild;
    const row = node.firstChild as Node;
    for (let i = 0, col = 0; i < row.childCount; i++) {
        const { colspan, colwidth } = row.child(i).attrs;
        for (let j = 0; j < colspan; j++, col++) {
            const hasWidth = overrideCol == col ? overrideValue : colwidth && colwidth[j];
            const cssWidth = hasWidth ? hasWidth + 'px' : '';
            totalWidth += hasWidth || cellMinWidth;
            if (!hasWidth) fixedWidth = false;
            if (!nextDOM) {
                colgroup.appendChild(document.createElement('col')).style.width = cssWidth;
            } else {
                if ((nextDOM as HTMLElement).style.width != cssWidth) (nextDOM as HTMLElement).style.width = cssWidth;
                nextDOM = nextDOM.nextSibling;
            }
        }
    }

    while (nextDOM) {
        const after = nextDOM.nextSibling;
        nextDOM.parentNode?.removeChild(nextDOM);
        nextDOM = after;
    }

    if (fixedWidth) {
        table.style.width = totalWidth + 'px';
        table.style.minWidth = '';
    } else {
        table.style.width = '';
        table.style.minWidth = totalWidth + 'px';
    }
}
