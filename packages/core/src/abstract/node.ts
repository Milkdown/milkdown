import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { Schema, NodeSpec, NodeType } from 'prosemirror-model';
import type { NodeSerializerSpec } from '../serializer';

import { Atom } from './atom';
import { LoadState } from '../constant';
import { AnyRecord, NodeViewFactory } from '../utility';
import { NodeParserSpec } from '../parser';

interface NodeOptional {
    readonly view?: NodeViewFactory;
    readonly keymap?: (nodeType: NodeType) => Keymap;
    readonly inputRules?: (nodeType: NodeType, schema: Schema) => InputRule[];
}

export abstract class Node<Options = AnyRecord> extends Atom<LoadState.Idle, Options> implements NodeOptional {
    view?: NodeOptional['view'];
    keymap?: NodeOptional['keymap'];
    inputRules?: NodeOptional['inputRules'];

    abstract readonly schema: NodeSpec;
    abstract readonly serializer: NodeSerializerSpec;
    abstract readonly parser: NodeParserSpec;

    override readonly loadAfter = LoadState.Idle;
    override main() {
        this.updateContext({
            nodes: this.context.nodes.concat(this),
        });
    }
}
