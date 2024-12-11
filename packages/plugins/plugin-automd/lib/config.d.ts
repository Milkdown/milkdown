import type { Ctx } from '@milkdown/ctx';
import type { Node, NodeType } from '@milkdown/prose/model';
import type { Transaction } from '@milkdown/prose/state';
export type ShouldSyncNode = (context: {
    prevNode: Node;
    nextNode: Node;
    ctx: Ctx;
    tr: Transaction;
    text: string;
}) => boolean;
export interface SyncNodePlaceholder {
    hole: string;
    punctuation: string;
    char: string;
}
export interface InlineSyncConfig {
    placeholderConfig: SyncNodePlaceholder;
    shouldSyncNode: ShouldSyncNode;
    globalNodes: Array<NodeType | string>;
    movePlaceholder: (placeholderToMove: string, text: string) => string;
}
export declare const defaultConfig: InlineSyncConfig;
export declare const inlineSyncConfig: import("@milkdown/utils").$Ctx<InlineSyncConfig, "inlineSyncConfig">;
//# sourceMappingURL=config.d.ts.map