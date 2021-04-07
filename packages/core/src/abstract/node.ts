import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { ParserSpec } from '../parser/types';
import type { SerializerNode } from '../serializer/types';
import { Base } from './base';

export abstract class Node extends Base<NodeType> {
    abstract readonly schema: NodeSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerNode;
}
