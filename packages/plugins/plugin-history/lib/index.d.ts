import type { MilkdownPlugin } from '@milkdown/ctx';
export declare const undoCommand: import("@milkdown/utils").$Command<unknown>;
export declare const redoCommand: import("@milkdown/utils").$Command<unknown>;
export declare const historyProviderConfig: import("@milkdown/utils").$Ctx<{
    depth?: number;
    newGroupDelay?: number;
}, "historyProviderConfig">;
export declare const historyProviderPlugin: import("@milkdown/utils").$Prose;
export declare const historyKeymap: import("@milkdown/utils").$UserKeymap<"historyKeymap", "Undo" | "Redo">;
export declare const history: MilkdownPlugin[];
//# sourceMappingURL=index.d.ts.map