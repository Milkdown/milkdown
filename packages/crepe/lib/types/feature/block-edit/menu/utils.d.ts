import type { html } from 'atomico';
import type { Ctx } from '@milkdown/kit/ctx';
import type { Command, Transaction } from '@milkdown/kit/prose/state';
import type { Attrs, NodeType } from '@milkdown/kit/prose/model';
export interface MenuItem {
    index: number;
    key: string;
    label: string;
    icon: ReturnType<typeof html>;
    onRun: (ctx: Ctx) => void;
}
type WithRange<T, HasIndex extends true | false = true> = HasIndex extends true ? T & {
    range: [start: number, end: number];
} : T;
export type MenuItemGroup<HasIndex extends true | false = true> = WithRange<{
    key: string;
    label: string;
    items: HasIndex extends true ? MenuItem[] : Omit<MenuItem, 'index'>[];
}, HasIndex>;
export declare function clearRange(tr: Transaction): Transaction;
export declare function setBlockType(tr: Transaction, nodeType: NodeType, attrs?: Attrs | null): Transaction;
export declare function wrapInBlockType(tr: Transaction, nodeType: NodeType, attrs?: Attrs | null): Transaction | null;
export declare function addBlockType(tr: Transaction, nodeType: NodeType, attrs?: Attrs | null): Transaction | null;
export declare function clearContentAndSetBlockType(nodeType: NodeType, attrs?: Attrs | null): Command;
export declare function clearContentAndWrapInBlockType(nodeType: NodeType, attrs?: Attrs | null): Command;
export declare function clearContentAndAddBlockType(nodeType: NodeType, attrs?: Attrs | null): Command;
export {};
//# sourceMappingURL=utils.d.ts.map