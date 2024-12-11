import type { Ctx } from '@milkdown/ctx';
import type { EditorState } from '@milkdown/prose/state';
import type { EditorView } from '@milkdown/prose/view';
import type { Placement } from '@floating-ui/dom';
import type { ActiveNode } from './types';
export interface DeriveContext {
    ctx: Ctx;
    active: ActiveNode;
    editorDom: HTMLElement;
    blockDom: HTMLElement;
}
export interface BlockProviderOptions {
    ctx: Ctx;
    content: HTMLElement;
    shouldShow?: (view: EditorView, prevState?: EditorState) => boolean;
    getOffset?: (deriveContext: DeriveContext) => number | {
        mainAxis?: number;
        crossAxis?: number;
        alignmentAxis?: number | null;
    };
    getPosition?: (deriveContext: DeriveContext) => Omit<DOMRect, 'toJSON'>;
    getPlacement?: (deriveContext: DeriveContext) => Placement;
}
export declare class BlockProvider {
    #private;
    get active(): Readonly<{
        $pos: import("prosemirror-model").ResolvedPos;
        node: import("prosemirror-model").Node;
        el: HTMLElement;
    }> | null;
    constructor(options: BlockProviderOptions);
    update: () => void;
    destroy: () => void;
    show: (active: ActiveNode) => void;
    hide: () => void;
}
//# sourceMappingURL=block-provider.d.ts.map