import type { MarkdownNode } from '..';
import type { JSONRecord } from '../utility';
import { StackElement } from '../utility';
export declare class SerializerStackElement extends StackElement<MarkdownNode> {
    type: string;
    children?: MarkdownNode[] | undefined;
    value?: string | undefined;
    props: JSONRecord;
    constructor(type: string, children?: MarkdownNode[] | undefined, value?: string | undefined, props?: JSONRecord);
    static create: (type: string, children?: MarkdownNode[], value?: string, props?: JSONRecord) => SerializerStackElement;
    push: (node: MarkdownNode, ...rest: MarkdownNode[]) => void;
    pop: () => MarkdownNode | undefined;
}
//# sourceMappingURL=stack-element.d.ts.map