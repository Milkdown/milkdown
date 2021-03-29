import { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { InputRule } from 'prosemirror-inputrules';
import { ParserSpec } from '../parser/types';
import { SerializerNode } from '../serializer/types';

export abstract class Node {
    abstract readonly name: string;
    abstract readonly schema: NodeSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerNode;
    abstract inputRules(nodeType: NodeType, schema: Schema): InputRule[];
}
