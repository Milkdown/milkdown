import type { Node } from '@milkdown/prose/model';
import type { SyncNodePlaceholder } from './config';
export declare function keepLink(str: string): string;
export declare function mergeSlash(str: string): string;
export declare function swap(text: string, first: number, last: number): string;
export declare function replacePunctuation(holePlaceholder: string): (text: string) => string;
export declare function calculatePlaceholder(placeholder: SyncNodePlaceholder): (text: string) => string;
export declare function calcOffset(node: Node, from: number, placeholder: string): number;
//# sourceMappingURL=utils.d.ts.map