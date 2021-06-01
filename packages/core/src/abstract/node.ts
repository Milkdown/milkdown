import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { Schema, NodeSpec, NodeType } from 'prosemirror-model';
import type { ParserSpec } from '../parser/types';
import type { IdleContext } from '../editor/context';
import type { SerializerNode } from '../serializer/types';

import { Atom } from './atom';
import { LoadState } from '../constant';
import { NodeViewFactory } from '../utility';

interface NodeOptional {
    readonly view?: NodeViewFactory;
    keymap?(nodeType: NodeType): Keymap;
    inputRules?(nodeType: NodeType, schema: Schema): InputRule[];
}

export abstract class Node extends Atom<IdleContext> implements NodeOptional {
    view: NodeOptional['view'];
    keymap: NodeOptional['keymap'];
    inputRules: NodeOptional['inputRules'];

    abstract readonly schema: NodeSpec;
    abstract readonly serializer: SerializerNode;
    abstract readonly parser: ParserSpec;

    override loadAfter = LoadState.Idle;
    override main() {
        this.updateContext({
            nodes: this.context.nodes.concat(this),
        });
    }
}
