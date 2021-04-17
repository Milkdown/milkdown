import { Schema } from 'prosemirror-model';
import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { buildObject } from '../utility';
import { IdleContext, SchemaReadyContext } from './context';

export class SchemaLoader extends Atom<IdleContext, SchemaReadyContext> {
    id = 'schemaLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.BuildSchema;
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
