/* Copyright 2021, Milkdown by Mirone. */
import type { MarkType, NodeType } from '@milkdown/prose';
import type { Node } from 'unist';

import type { State } from './state';

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

export type ParserSpecWithType =
    | (NodeParserSpec & { is: 'node'; key: string })
    | (MarkParserSpec & { is: 'mark'; key: string });
export type InnerParserSpecMap = Record<string, ParserSpecWithType>;
