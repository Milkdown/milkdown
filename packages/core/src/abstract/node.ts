import type { NodeSpec, NodeType, Node as ProsemirrorNode } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import type { Editor } from '../editor';
import type { SerializerNode } from '../serializer/types';
import { Base } from './base';

export type NodeViewFn = (
    editor: Editor,
    nodeType: NodeType,
    node: ProsemirrorNode,
    view: EditorView,
    getPos: () => number,
    declarations: Decoration[],
) => NodeView;

export interface Node {
    readonly view?: NodeViewFn;
}

export abstract class Node extends Base<NodeType> {
    abstract readonly schema: NodeSpec;
    abstract readonly serializer: SerializerNode;
}
