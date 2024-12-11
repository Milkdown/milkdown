import type { MilkdownPlugin, TimerType } from '@milkdown/ctx';
import type { DirectEditorProps } from '@milkdown/prose/view';
type EditorOptions = Omit<DirectEditorProps, 'state'>;
type RootType = Node | undefined | null | string;
export declare const EditorViewReady: TimerType;
export declare const editorViewTimerCtx: import("@milkdown/ctx").SliceType<TimerType[], "editorViewTimer">;
export declare const editorViewOptionsCtx: import("@milkdown/ctx").SliceType<Partial<EditorOptions>, "editorViewOptions">;
export declare const rootCtx: import("@milkdown/ctx").SliceType<RootType, "root">;
export declare const rootDOMCtx: import("@milkdown/ctx").SliceType<HTMLElement, "rootDOM">;
export declare const rootAttrsCtx: import("@milkdown/ctx").SliceType<Record<string, string>, "rootAttrs">;
export declare const editorView: MilkdownPlugin;
export {};
//# sourceMappingURL=editor-view.d.ts.map