import type { Ctx } from '@milkdown/ctx';
import type { EditorView } from '@milkdown/prose/view';
import type { ActiveNode } from './types';
export type BlockServiceMessageType = {
    type: 'hide';
} | {
    type: 'show';
    active: ActiveNode;
};
export type BlockServiceMessage = (message: BlockServiceMessageType) => void;
export declare class BlockService {
    #private;
    bind: (ctx: Ctx, notify: BlockServiceMessage) => void;
    addEvent: (dom: HTMLElement) => void;
    removeEvent: (dom: HTMLElement) => void;
    unBind: () => void;
    keydownCallback: (view: EditorView) => boolean;
    mousemoveCallback: (view: EditorView, event: MouseEvent) => boolean;
    dragoverCallback: (view: EditorView, event: DragEvent) => boolean;
    dragenterCallback: (view: EditorView) => void;
    dragleaveCallback: (view: EditorView, event: DragEvent) => void;
    dropCallback: (view: EditorView) => boolean;
    dragendCallback: (view: EditorView) => void;
}
//# sourceMappingURL=block-service.d.ts.map