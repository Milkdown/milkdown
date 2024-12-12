import type { MarkSpec, NodeSpec } from '@milkdown/prose/model';
import type { remark } from 'remark';
import type { Plugin, Transformer } from 'unified';
import type { MarkParserSpec, NodeParserSpec } from '../parser/types';
import type { MarkSerializerSpec, NodeSerializerSpec } from '../serializer/types';
export type Node = Parameters<Transformer>[0];
export type Root = Parameters<(typeof remark)['stringify']>[0];
export type JSONValue = string | number | boolean | null | JSONValue[] | {
    [key: string]: JSONValue;
};
export type JSONRecord = Record<string, JSONValue>;
export type RemarkPluginRaw<T> = Plugin<[T], Root>;
export interface RemarkPlugin<T = Record<string, unknown>> {
    plugin: Plugin<[T], Root>;
    options: T;
}
export type RemarkParser = ReturnType<typeof remark>;
export type MarkdownNode = Node & {
    children?: MarkdownNode[];
    [x: string]: unknown;
};
export interface NodeSchema extends NodeSpec {
    readonly toMarkdown: NodeSerializerSpec;
    readonly parseMarkdown: NodeParserSpec;
    readonly priority?: number;
}
export interface MarkSchema extends MarkSpec {
    readonly toMarkdown: MarkSerializerSpec;
    readonly parseMarkdown: MarkParserSpec;
}
//# sourceMappingURL=types.d.ts.map