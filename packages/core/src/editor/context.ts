import type MarkdownIt from 'markdown-it';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { Node as ProsemirrorNode, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { EditorView } from 'prosemirror-view';
import type { MarkView, NodeView } from '../utility';
import type { LoadState } from '../constant';
import type { Mark, Node } from '../abstract';
import type { Editor } from '.';

export type DocListener = (doc: Node) => void;
export type MarkdownListener = (getMarkdown: () => string) => void;
export type Listener = {
    doc?: DocListener[];
    markdown?: MarkdownListener[];
};

export interface IdleContext {
    markdownIt: MarkdownIt;
    loadState: LoadState;
    nodes: Node[];
    marks: Mark[];
    editor: Editor;
}

export interface SchemaReadyContext extends Readonly<IdleContext> {
    schema: Schema;
}

export interface PluginReadyContext extends Readonly<SchemaReadyContext> {
    parser: (text: string) => ProsemirrorNode | null;
    serializer: (node: ProsemirrorNode) => string;
    inputRules: InputRule[];
    keymap: ProsemirrorPlugin[];
    nodeViews: Record<string, NodeView | MarkView>;
    prosemirrorPlugins: ProsemirrorPlugin[];
}

export interface ProsemirrorReadyContext extends Readonly<PluginReadyContext> {
    editorView: EditorView;
}
