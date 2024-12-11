import type { MarkType, Node, NodeType } from '@milkdown/prose/model';
import type { MarkdownNode } from '../utility/types';
import type { ParserState } from './state';
export type Parser = (text: string) => Node;
export interface NodeParserSpec {
    match: (node: MarkdownNode) => boolean;
    runner: (state: ParserState, node: MarkdownNode, proseType: NodeType) => void;
}
export interface MarkParserSpec {
    match: (node: MarkdownNode) => boolean;
    runner: (state: ParserState, node: MarkdownNode, proseType: MarkType) => void;
}
//# sourceMappingURL=types.d.ts.map