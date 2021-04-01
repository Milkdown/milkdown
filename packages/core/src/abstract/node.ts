import type { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { ParserSpec } from '../parser/types';
import type { SerializerNode } from '../serializer/types';
import { Base } from './base';

export abstract class Node extends Base {
    abstract readonly name: string;
    abstract readonly schema: NodeSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerNode;
    abstract inputRules(nodeType: NodeType, schema: Schema): InputRule[];
}
