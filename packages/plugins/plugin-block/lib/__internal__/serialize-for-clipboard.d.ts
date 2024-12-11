/**
 * Copy pasted from https://github.com/ProseMirror/prosemirror-view/blob/master/src/clipboard.ts
 */
import type { Slice } from '@milkdown/prose/model';
import type { EditorView } from '@milkdown/prose/view';
export declare function serializeForClipboard(view: EditorView, slice: Slice): {
    dom: HTMLDivElement;
    text: string;
};
//# sourceMappingURL=serialize-for-clipboard.d.ts.map