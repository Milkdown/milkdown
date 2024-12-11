import type { Mark, Node } from '@milkdown/prose/model';
import type { SerializerState } from './state';
export type Serializer = (content: Node) => string;
export interface NodeSerializerSpec {
    match: (node: Node) => boolean;
    runner: (state: SerializerState, node: Node) => void;
}
export interface MarkSerializerSpec {
    match: (mark: Mark) => boolean;
    runner: (state: SerializerState, mark: Mark, node: Node) => void | boolean;
}
//# sourceMappingURL=types.d.ts.map