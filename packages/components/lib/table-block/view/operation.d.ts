import type { Ctx } from '@milkdown/ctx';
import type { Refs } from './types';
export declare function useOperation(refs: Refs, ctx?: Ctx, getPos?: () => number | undefined): {
    onAddRow: () => void;
    onAddCol: () => void;
    selectCol: () => void;
    selectRow: () => void;
    deleteSelected: (e: PointerEvent) => void;
    onAlign: (direction: "left" | "center" | "right") => (e: PointerEvent) => void;
};
//# sourceMappingURL=operation.d.ts.map