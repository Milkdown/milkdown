import type { Fragment, Node, Schema } from '@milkdown/prose/model';
import { Mark } from '@milkdown/prose/model';
import type { JSONRecord, MarkdownNode, RemarkParser } from '../utility';
import { Stack } from '../utility';
import { SerializerStackElement } from './stack-element';
import type { Serializer } from './types';
export declare class SerializerState extends Stack<MarkdownNode, SerializerStackElement> {
    #private;
    readonly schema: Schema;
    static create: (schema: Schema, remark: RemarkParser) => Serializer;
    constructor(schema: Schema);
    openNode: (type: string, value?: string, props?: JSONRecord) => this;
    closeNode: () => this;
    addNode: (type: string, children?: MarkdownNode[], value?: string, props?: JSONRecord) => this;
    withMark: (mark: Mark, type: string, value?: string, props?: JSONRecord) => this;
    closeMark: (mark: Mark) => this;
    build: () => MarkdownNode;
    next: (nodes: Node | Fragment) => this;
    toString: (remark: RemarkParser) => string;
    run: (tree: Node) => this;
}
//# sourceMappingURL=state.d.ts.map