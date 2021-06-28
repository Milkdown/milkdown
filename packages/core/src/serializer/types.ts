import type { Mark as ProseMark, Node as ProseNode } from 'prosemirror-model';
import type { Node as MarkdownNode } from 'unist';
import type { State } from './state';

export type NodeMap = Record<string, SerializerNode>;
export type MarkMap = Record<string, SerializerMark>;

export type SerializerNode = (state: State, node: ProseNode, parent: ProseNode, index: number) => void;

export type SerializerMark = {
    open: MarkFactory | string;
    close: MarkFactory | string;
    priority?: number;
};

type MarkFactory = (state: State, mark: ProseMark, parent: ProseNode, index: number) => string;

export type NodeSerializerSpec = {
    match: (node: ProseNode) => boolean;
    runner: (node: ProseNode, state: State) => MarkdownNode;
};
export type MarkSerializerSpec = {
    match: (mark: ProseMark) => boolean;
    runner: (mark: ProseMark, state: State) => MarkdownNode;
};
export type SerializerSpec = NodeSerializerSpec | MarkSerializerSpec;

export type SerializerSpecWithType = (NodeSerializerSpec & { is: 'node' }) | (MarkSerializerSpec & { is: 'mark' });
export type InnerSerializerSpecMap = Record<string, SerializerSpecWithType>;
