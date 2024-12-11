import type { Editor } from '@milkdown/core';
import type { Ref } from 'vue';
export type GetEditor = (container: HTMLDivElement) => Editor;
export interface EditorInfoCtx {
    dom: Ref<HTMLDivElement | null>;
    editor: Ref<Editor | undefined>;
    editorFactory: Ref<GetEditor | undefined>;
    loading: Ref<boolean>;
}
export interface UseEditorReturn {
    loading: Ref<boolean>;
    get: () => Editor | undefined;
}
//# sourceMappingURL=types.d.ts.map