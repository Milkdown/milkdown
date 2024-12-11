import type { MilkdownPlugin } from '@milkdown/ctx';
export interface IndentConfigOptions {
    type: 'space' | 'tab';
    size: number;
}
export declare const indentConfig: import("@milkdown/utils").$Ctx<IndentConfigOptions, "indentConfig">;
export declare const indentPlugin: import("@milkdown/utils").$Shortcut;
export declare const indent: MilkdownPlugin[];
//# sourceMappingURL=index.d.ts.map