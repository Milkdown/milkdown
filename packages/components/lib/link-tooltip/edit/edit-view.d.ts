import type { Ctx } from '@milkdown/ctx';
import type { PluginView } from '@milkdown/prose/state';
import type { Mark } from '@milkdown/prose/model';
import type { EditorView } from '@milkdown/prose/view';
export declare class LinkEditTooltip implements PluginView {
    #private;
    readonly ctx: Ctx;
    constructor(ctx: Ctx, view: EditorView);
    update: (view: EditorView) => void;
    destroy: () => void;
    addLink: (from: number, to: number) => void;
    editLink: (mark: Mark, from: number, to: number) => void;
    removeLink: (from: number, to: number) => void;
}
//# sourceMappingURL=edit-view.d.ts.map