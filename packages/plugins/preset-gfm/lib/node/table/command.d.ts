export declare const goToPrevTableCellCommand: import("@milkdown/utils").$Command<unknown>;
export declare const goToNextTableCellCommand: import("@milkdown/utils").$Command<unknown>;
export declare const exitTable: import("@milkdown/utils").$Command<unknown>;
export declare const insertTableCommand: import("@milkdown/utils").$Command<{
    row?: number;
    col?: number;
}>;
export declare const moveRowCommand: import("@milkdown/utils").$Command<{
    from?: number;
    to?: number;
    pos?: number;
}>;
export declare const moveColCommand: import("@milkdown/utils").$Command<{
    from?: number;
    to?: number;
    pos?: number;
}>;
export declare const selectRowCommand: import("@milkdown/utils").$Command<{
    index: number;
    pos?: number;
}>;
export declare const selectColCommand: import("@milkdown/utils").$Command<{
    index: number;
    pos?: number;
}>;
export declare const selectTableCommand: import("@milkdown/utils").$Command<unknown>;
export declare const deleteSelectedCellsCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addColBeforeCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addColAfterCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addRowBeforeCommand: import("@milkdown/utils").$Command<unknown>;
export declare const addRowAfterCommand: import("@milkdown/utils").$Command<unknown>;
export declare const setAlignCommand: import("@milkdown/utils").$Command<"center" | "left" | "right">;
//# sourceMappingURL=command.d.ts.map