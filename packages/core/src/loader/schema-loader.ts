import { Schema } from 'prosemirror-model';
import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { buildObject } from '../utility';

export class SchemaLoader extends Atom<LoadState.LoadSchema> {
    override readonly id = 'schemaLoader';
    override readonly loadAfter = LoadState.LoadSchema;
    override main() {
        const nodes = buildObject(this.context.nodes, (node) => [node.id, node.schema]);
        const marks = buildObject(this.context.marks, (mark) => [mark.id, mark.schema]);

        const schema = new Schema({
            nodes: {
                ...nodes,
            },
            marks,
        });
        this.updateContext({ schema });
    }
}
