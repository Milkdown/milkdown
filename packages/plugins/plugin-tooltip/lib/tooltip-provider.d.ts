import type { EditorState } from '@milkdown/prose/state';
import type { EditorView } from '@milkdown/prose/view';
import type { VirtualElement } from '@floating-ui/dom';
export interface TooltipProviderOptions {
    content: HTMLElement;
    debounce?: number;
    shouldShow?: (view: EditorView, prevState?: EditorState) => boolean;
    offset?: number | {
        mainAxis?: number;
        crossAxis?: number;
        alignmentAxis?: number | null;
    };
}
export declare class TooltipProvider {
    #private;
    element: HTMLElement;
    onShow: () => void;
    onHide: () => void;
    constructor(options: TooltipProviderOptions);
    update: (view: EditorView, prevState?: EditorState) => void;
    destroy: () => void;
    show: (virtualElement?: VirtualElement) => void;
    hide: () => void;
}
//# sourceMappingURL=tooltip-provider.d.ts.map