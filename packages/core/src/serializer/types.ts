import type { Mark as ProseMark, Node as ProseNode } from 'prosemirror-model';
import type { State } from './state';

export type NodeSerializerSpec = {
    match: (node: ProseNode) => boolean;
    runner: (node: ProseNode, state: State) => void;
};
export type MarkSerializerSpec = {
    match: (mark: ProseMark) => boolean;
    runner: (mark: ProseMark, state: State) => void;
};
export type SerializerSpec = NodeSerializerSpec | MarkSerializerSpec;

export type SerializerSpecWithType = (NodeSerializerSpec & { is: 'node' }) | (MarkSerializerSpec & { is: 'mark' });
export type InnerSerializerSpecMap = Record<string, SerializerSpecWithType>;
