import type { Attrs, MarkType, Node, NodeType, Schema } from '@milkdown/prose/model';
import type { MarkdownNode, RemarkParser } from '../utility';
import { Stack } from '../utility';
import { ParserStackElement } from './stack-element';
import type { Parser } from './types';
export declare class ParserState extends Stack<Node, ParserStackElement> {
    #private;
    readonly schema: Schema;
    static create: (schema: Schema, remark: RemarkParser) => Parser;
    protected constructor(schema: Schema);
    injectRoot: (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => this;
    openNode: (nodeType: NodeType, attrs?: Attrs) => this;
    closeNode: () => this;
    addNode: (nodeType: NodeType, attrs?: Attrs, content?: Node[]) => this;
    openMark: (markType: MarkType, attrs?: Attrs) => this;
    closeMark: (markType: MarkType) => this;
    addText: (text: string) => this;
    build: () => Node;
    next: (nodes?: MarkdownNode | MarkdownNode[]) => this;
    toDoc: () => Node;
    run: (remark: RemarkParser, markdown: string) => this;
}
//# sourceMappingURL=state.d.ts.map