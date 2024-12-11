import type { MilkdownPlugin, TimerType } from '@milkdown/ctx';
import type { Schema } from '@milkdown/prose/model';
import { Node } from '@milkdown/prose/model';
import { EditorState } from '@milkdown/prose/state';
import type { JSONRecord, Parser } from '@milkdown/transformer';
export type DefaultValue = string | {
    type: 'html';
    dom: HTMLElement;
} | {
    type: 'json';
    value: JSONRecord;
};
type StateOptions = Parameters<typeof EditorState.create>[0];
type StateOptionsOverride = (prev: StateOptions) => StateOptions;
export declare const defaultValueCtx: import("@milkdown/ctx").SliceType<DefaultValue, "defaultValue">;
export declare const editorStateOptionsCtx: import("@milkdown/ctx").SliceType<StateOptionsOverride, string>;
export declare const editorStateTimerCtx: import("@milkdown/ctx").SliceType<TimerType[], "editorStateTimer">;
export declare const EditorStateReady: TimerType;
export declare function getDoc(defaultValue: DefaultValue, parser: Parser, schema: Schema): Node;
export declare const editorState: MilkdownPlugin;
export {};
//# sourceMappingURL=editor-state.d.ts.map