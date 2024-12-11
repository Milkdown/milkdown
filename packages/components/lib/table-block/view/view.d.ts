import type { Node } from '@milkdown/prose/model';
import type { EditorView, NodeView, NodeViewConstructor } from '@milkdown/prose/view';
import type { Ctx } from '@milkdown/ctx';
import type { TableComponentProps } from './component';
export declare class TableNodeView implements NodeView {
    #private;
    ctx: Ctx;
    node: Node;
    view: EditorView;
    getPos: () => number | undefined;
    dom: HTMLElement & TableComponentProps;
    contentDOM: HTMLElement;
    constructor(ctx: Ctx, node: Node, view: EditorView, getPos: () => number | undefined);
    update(node: Node): boolean;
    stopEvent(e: Event): boolean;
    ignoreMutation(mutation: MutationRecord): boolean;
}
export declare const tableBlockView: import("@milkdown/utils").$View<import("@milkdown/utils").$Node, NodeViewConstructor>;
//# sourceMappingURL=view.d.ts.map