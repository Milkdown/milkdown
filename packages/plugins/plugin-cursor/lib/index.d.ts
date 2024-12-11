import type { MilkdownPlugin } from '@milkdown/ctx';
export interface DropCursorOptions {
    /**
      The color of the cursor. Defaults to `black`.
     */
    color?: string | false;
    /**
      The precise width of the cursor in pixels. Defaults to 1.
     */
    width?: number;
    /**
      A CSS class name to add to the cursor element.
     */
    class?: string;
}
export declare const dropCursorConfig: import("@milkdown/utils").$Ctx<DropCursorOptions, "dropCursorConfig">;
export declare const dropCursorPlugin: import("@milkdown/utils").$Prose;
export declare const gapCursorPlugin: import("@milkdown/utils").$Prose;
export declare const cursor: MilkdownPlugin[];
//# sourceMappingURL=index.d.ts.map