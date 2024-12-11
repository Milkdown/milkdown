import type { Node, ResolvedPos } from '@milkdown/prose/model';
export type FilterNodes = (pos: ResolvedPos, node: Node) => boolean;
export declare const defaultNodeFilter: FilterNodes;
export declare const blockConfig: import("@milkdown/utils").$Ctx<{
    filterNodes: FilterNodes;
}, "blockConfig">;
//# sourceMappingURL=block-config.d.ts.map