import type { Refractor } from 'refractor/lib/core';
import type { MilkdownPlugin } from '@milkdown/ctx';
export interface Options {
    configureRefractor: (refractor: Refractor) => void | Refractor;
}
export declare const prismConfig: import("@milkdown/utils").$Ctx<Options, "prismConfig">;
export declare const prismPlugin: import("@milkdown/utils").$Prose;
export declare const prism: MilkdownPlugin[];
//# sourceMappingURL=index.d.ts.map