import type { MilkdownPlugin } from '@milkdown/ctx';
import type { Node } from '@milkdown/prose/model';
import type { EditorState } from '@milkdown/prose/state';
export interface TrailingConfigOptions {
    shouldAppend: (lastNode: Node | null, state: EditorState) => boolean;
    getNode: (state: EditorState) => Node;
}
export declare const trailingConfig: import("@milkdown/utils").$Ctx<TrailingConfigOptions, "trailingConfig">;
export declare const trailingPlugin: import("@milkdown/utils").$Prose;
export declare const trailing: MilkdownPlugin[];
//# sourceMappingURL=index.d.ts.map