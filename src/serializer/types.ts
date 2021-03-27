import type { Mark, Node } from 'prosemirror-model';
import type { State } from './state';

export type NodeMap = Record<string, SerializerNode>;
export type MarkMap = Record<string, SerializerMark>;

export type SerializerNode = (state: State, node: Node, parent: Node, index: number) => void;

export type SerializerMark = {
    open: MarkFactory | string;
    close: MarkFactory | string;
};

type MarkFactory = (state: State, mark: Mark, parent: Node, index: number) => string;
