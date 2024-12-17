import type { Node } from '@milkdown/prose/model';
import type { EditorView } from '@milkdown/prose/view';
import type { Ref } from 'atomico';
import type { Ctx } from '@milkdown/ctx';
import type { CellIndex, Refs } from './types';
export declare function findNodeIndex(parent: Node, child: Node): number;
export declare function findPointerIndex(event: PointerEvent, view?: EditorView): CellIndex | undefined;
export declare function getRelatedDOM(contentWrapperRef: Ref<HTMLDivElement>, [rowIndex, columnIndex]: CellIndex): {
    row: HTMLTableRowElement;
    col: Element;
    headerCol: Element;
} | undefined;
export declare function recoveryStateBetweenUpdate(refs: Refs, ctx?: Ctx, node?: Node): void;
interface ComputeHandlePositionByIndexProps {
    refs: Refs;
    index: CellIndex;
    before?: (handleDOM: HTMLDivElement) => void;
    after?: (handleDOM: HTMLDivElement) => void;
}
export declare function computeColHandlePositionByIndex({ refs, index, before, after, }: ComputeHandlePositionByIndexProps): void;
export declare function computeRowHandlePositionByIndex({ refs, index, before, after, }: ComputeHandlePositionByIndexProps): void;
export {};
//# sourceMappingURL=utils.d.ts.map