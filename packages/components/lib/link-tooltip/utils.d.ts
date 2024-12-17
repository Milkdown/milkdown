import type { Mark, Node } from '@milkdown/prose/model';
import type { Ctx } from '@milkdown/ctx';
import type { EditorView } from '@milkdown/prose/view';
export declare function findMarkPosition(mark: Mark, node: Node, doc: Node, from: number, to: number): {
    start: number;
    end: number;
};
export declare function shouldShowPreviewWhenHover(ctx: Ctx, view: EditorView, event: MouseEvent): {
    show: boolean;
    pos: number;
    node: Node;
    mark: Mark;
} | undefined;
//# sourceMappingURL=utils.d.ts.map