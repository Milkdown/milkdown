import type { NodeType, MarkType } from 'prosemirror-model';
import type { State } from './state';
import type { Node } from 'unist';

export type Attrs = Record<string, string | number | boolean | null>;

export type Runner<T extends NodeType | MarkType = NodeType | MarkType> = (
    proseType: T,
    state: State,
    Node: Node & { children?: Node[] },
) => void;
export type ParserSpec<T extends NodeType | MarkType = NodeType | MarkType> = {
    match: (node: Node) => boolean;
    runner: Runner<T>;
};
export type NodeParserSpec = ParserSpec<NodeType>;
export type MarkParserSpec = ParserSpec<MarkType>;
