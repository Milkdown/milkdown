import type { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import type { InputRule } from 'prosemirror-inputrules';
import type { Editor } from '../editor';
import type { ParserSpec } from '../parser/types';
import type { SerializerNode } from '../serializer/types';

export abstract class Node {
    constructor(readonly editor: Editor) {}
    abstract readonly name: string;
    abstract readonly schema: NodeSpec;
    abstract readonly parser: ParserSpec;
    abstract readonly serializer: SerializerNode;
    abstract inputRules(nodeType: NodeType, schema: Schema): InputRule[];
}
