import type MarkdownIt from 'markdown-it';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import type { Node, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkView, NodeView } from '../utility/prosemirror';

export enum LoadState {
    Idle,
    SchemaReady,
    TransformerReady,
    Complete,
}

type DocListener = (type: 'doc', doc: Node) => void;
type MarkdownListener = (type: 'markdown', getMarkdown: () => string) => void;
type Listener = DocListener | MarkdownListener;

export interface IdleContext {
    root: Element;
    markdownIt: MarkdownIt;
    loadState: LoadState;
    listener: Listener[];
}

export interface SchemaReadyContext extends Readonly<IdleContext> {
    schema: Schema;
}

export interface TransformerReadyContext extends Readonly<SchemaReadyContext> {
    parser: (text: string) => Node | null;
    serializer: (node: Node) => string;
}

export interface ProsemirrorReadyContext extends Readonly<TransformerReadyContext> {
    inputRules: InputRule[];
    keymap: ProsemirrorPlugin[];
    nodeViews: Record<string, NodeView | MarkView>;
}
