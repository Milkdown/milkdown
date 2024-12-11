import type { Attrs, Node, NodeType } from '@milkdown/prose/model';
import { StackElement } from '../utility';
export declare class ParserStackElement extends StackElement<Node> {
    type: NodeType;
    content: Node[];
    attrs?: Attrs | undefined;
    constructor(type: NodeType, content: Node[], attrs?: Attrs | undefined);
    push(node: Node, ...rest: Node[]): void;
    pop(): Node | undefined;
    static create(type: NodeType, content: Node[], attrs?: Attrs): ParserStackElement;
}
//# sourceMappingURL=stack-element.d.ts.map