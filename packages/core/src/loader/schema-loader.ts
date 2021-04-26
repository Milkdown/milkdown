import type { IdleContext, SchemaReadyContext } from '../editor';

import { Schema } from 'prosemirror-model';
import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { buildObject } from '../utility';

export class SchemaLoader extends Atom<IdleContext, SchemaReadyContext> {
    id = 'schemaLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.LoadSchema;
    main() {
        const nodes = buildObject(this.context.nodes, (node) => [node.id, node.schema]);
        const marks = buildObject(this.context.marks, (mark) => [mark.id, mark.schema]);

        const schema = new Schema({
            nodes: {
                doc: { content: 'block+' },
                ...nodes,
                text: { group: 'inline' },
            },
            marks,
        });
        this.updateContext({ schema });
    }
}
