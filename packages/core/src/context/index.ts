import type { InputRule } from 'prosemirror-inputrules';
import type { Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { EditorView, NodeView } from 'prosemirror-view';
import type { RemarkOptions } from 'remark';
import type { Processor } from 'unified';
import type { Mark, Node } from '../abstract';
import type { LoadState } from '../constant';
import type { Editor } from '../editor';
import type { AnyRecord, MarkViewParams, NodeViewParams } from '../utility';

export type GetCurrentContextByState<T extends LoadState> = T extends LoadState.Idle
    ? IdleContext
    : T extends LoadState.LoadSchema
    ? IdleContext
    : T extends LoadState.SchemaReady
    ? SchemaReadyContext
    : T extends LoadState.LoadPlugin
    ? LoadPluginContext
    : T extends LoadState.Complete
    ? CompleteContext
    : AnyRecord;

export type GetNextContextByState<T extends LoadState> = T extends LoadState.Idle
    ? IdleContext
    : T extends LoadState.LoadSchema
    ? SchemaReadyContext
    : T extends LoadState.SchemaReady
    ? LoadPluginContext
    : T extends LoadState.LoadPlugin
    ? CompleteContext
    : T extends LoadState.Complete
    ? CompleteContext
    : AnyRecord;

export interface IdleContext {
    remark: Processor<RemarkOptions>;
    loadState: LoadState;
    nodes: Node[];
    marks: Mark[];
    editor: Editor;
}

export interface SchemaReadyContext extends Readonly<IdleContext> {
    schema: Schema;
    parser: (text: string) => ProsemirrorNode | null;
    serializer: (node: ProsemirrorNode) => string;
    keymap: ProsemirrorPlugin[];
    inputRules: InputRule[];
    nodeViews: Record<string, (...args: NodeViewParams | MarkViewParams) => NodeView>;
}

export interface LoadPluginContext extends Readonly<SchemaReadyContext> {
    prosemirrorPlugins: ProsemirrorPlugin[];
}

export interface CompleteContext extends Readonly<LoadPluginContext> {
    editorView: EditorView;
}
