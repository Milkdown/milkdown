import type { PluginView } from '@milkdown/prose/state';
import type { EditorView } from '@milkdown/prose/view';
import type { Mark } from '@milkdown/prose/model';
import type { Ctx } from '@milkdown/ctx';
export declare class LinkPreviewTooltip implements PluginView {
    #private;
    readonly ctx: Ctx;
    constructor(ctx: Ctx, view: EditorView);
    show: (mark: Mark, from: number, to: number, rect: DOMRect) => void;
    hide: () => void;
    update: () => void;
    destroy: () => void;
}
//# sourceMappingURL=preview-view.d.ts.map