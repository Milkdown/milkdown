export declare abstract class StackElement<Node> {
    abstract push(node: Node, ...rest: Node[]): void;
}
export declare class Stack<Node, Element extends StackElement<Node>> {
    protected elements: Element[];
    size: () => number;
    top: () => Element | undefined;
    push: (node: Node) => void;
    open: (node: Element) => void;
    close: () => Element;
}
//# sourceMappingURL=stack.d.ts.map