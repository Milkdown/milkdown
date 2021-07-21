import type { NodeType, MarkType } from 'prosemirror-model';
import type { State } from './state';
import type { Node } from 'unist';

export type Attrs = Record<string, string | number | boolean | null>;
export type MarkdownNode = Node & { children?: MarkdownNode[]; [x: string]: unknown };

export type ParserRunner<T extends NodeType | MarkType = NodeType | MarkType> = (
    state: State,
    Node: MarkdownNode,
    proseType: T,
) => void;
export type ParserSpec<T extends NodeType | MarkType = NodeType | MarkType> = {
    match: (node: MarkdownNode) => boolean;
    runner: ParserRunner<T>;
};
export type NodeParserSpec = ParserSpec<NodeType>;
export type MarkParserSpec = ParserSpec<MarkType>;

export type ParserSpecWithType = (NodeParserSpec & { is: 'node' }) | (MarkParserSpec & { is: 'mark' });
export type InnerParserSpecMap = Record<string, ParserSpecWithType>;
