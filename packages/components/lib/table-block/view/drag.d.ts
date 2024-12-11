import type { Ctx } from '@milkdown/ctx';
import type { Refs } from './types';
export declare function createDragRowHandler(refs: Refs, ctx?: Ctx): (event: DragEvent) => void;
export declare function createDragColHandler(refs: Refs, ctx?: Ctx): (event: DragEvent) => void;
export declare function createDragOverHandler(refs: Refs): (e: DragEvent) => void;
export declare function useDragHandlers(refs: Refs, ctx?: Ctx, getPos?: () => number | undefined): {
    dragRow: (event: DragEvent) => void;
    dragCol: (event: DragEvent) => void;
};
//# sourceMappingURL=drag.d.ts.map