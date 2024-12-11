import type { EditorState } from '@milkdown/prose/state';
import type { Node } from '@milkdown/prose/model';
import type { EditorView } from '@milkdown/prose/view';
export interface SlashProviderOptions {
    content: HTMLElement;
    debounce?: number;
    shouldShow?: (view: EditorView, prevState?: EditorState) => boolean;
    trigger?: string | string[];
    offset?: number | {
        mainAxis?: number;
        crossAxis?: number;
        alignmentAxis?: number | null;
    };
}
export declare class SlashProvider {
    #private;
    element: HTMLElement;
    onShow: () => void;
    onHide: () => void;
    constructor(options: SlashProviderOptions);
    update: (view: EditorView, prevState?: EditorState) => void;
    getContent: (view: EditorView, matchNode?: (node: Node) => boolean) => string | undefined;
    destroy: () => void;
    show: () => void;
    hide: () => void;
}
//# sourceMappingURL=slash-provider.d.ts.map