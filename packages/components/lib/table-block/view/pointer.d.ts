import type { EditorView } from '@milkdown/prose/view';
import type { Refs } from './types';
export declare function createPointerMoveHandler(refs: Refs, view?: EditorView): (e: PointerEvent) => void;
export declare function createPointerLeaveHandler(refs: Refs): () => void;
export declare function usePointerHandlers(refs: Refs, view?: EditorView): {
    pointerMove: (e: PointerEvent) => void;
    pointerLeave: () => void;
};
//# sourceMappingURL=pointer.d.ts.map