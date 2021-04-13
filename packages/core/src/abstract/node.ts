import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { SerializerNode } from '../serializer/types';
import { Base } from './base';

export abstract class Node extends Base<NodeType> {
    abstract readonly schema: NodeSpec;
    abstract readonly serializer: SerializerNode;
}
