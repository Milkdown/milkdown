import type MarkdownIt from 'markdown-it';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { EditorView } from 'prosemirror-view';
import type { MarkView, NodeView } from '../utility';
import type { LoadState } from '../constant';
import type { Mark, Node } from '../abstract';
import type { Editor } from '.';

export interface IdleContext {
    markdownIt: MarkdownIt;
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
    nodeViews: Record<string, NodeView | MarkView>;
}

export interface LoadPluginContext extends Readonly<SchemaReadyContext> {
    prosemirrorPlugins: ProsemirrorPlugin[];
}

export interface CompleteContext extends Readonly<LoadPluginContext> {
    editorView: EditorView;
}
