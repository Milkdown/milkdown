import type { Ctx } from '@milkdown/ctx';
import type { Node } from '@milkdown/prose/model';
import type { EditorState } from '@milkdown/prose/state';
export interface InlineSyncContext {
    text: string;
    prevNode: Node;
    nextNode: Node;
    placeholder: string;
}
export declare function getContextByState(ctx: Ctx, state: EditorState): InlineSyncContext | null;
//# sourceMappingURL=context.d.ts.map