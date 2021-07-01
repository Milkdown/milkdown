import type { Processor } from 'unified';
import type { RemarkOptions } from 'remark';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { EditorView, NodeView } from 'prosemirror-view';
import type { LoadState } from '../constant';
import type { Mark, Node } from '../abstract';
import type { MarkViewParams, NodeViewParams } from '../utility';
import type { Editor } from '.';

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
