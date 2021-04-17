import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { Schema, NodeSpec, NodeType, Node as ProsemirrorNode } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import type { ParserSpec } from '../parser/types';
import type { Editor } from '../editor';
import type { IdleContext } from '../editor/context';
import type { SerializerNode } from '../serializer/types';

import { Atom } from './atom';
import { AtomType, LoadState } from '../constant';

export type NodeViewFn = (
    editor: Editor,
    nodeType: NodeType,
    node: ProsemirrorNode,
    view: EditorView,
    getPos: () => number,
    declarations: Decoration[],
) => NodeView;

export interface Node {
    readonly view?: NodeViewFn;
    keymap?(nodeType: NodeType): Keymap;
    inputRules?(markType: NodeType, schema: Schema): InputRule[];
}

export abstract class Node extends Atom<IdleContext> {
    abstract readonly schema: NodeSpec;
    abstract readonly serializer: SerializerNode;
    abstract readonly parser: ParserSpec;

    loadAfter = LoadState.Idle;
    type = AtomType.ProsemirrorSpec;
    main() {
        this.updateContext({
            nodes: this.context.nodes.concat(this),
        });
    }
}
