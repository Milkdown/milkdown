import { Schema } from 'prosemirror-model';
import { LoadSchema, SchemaReady } from '../constant';
import { marks, nodes, schema } from '../context';
import { Ctx } from '../editor';
import { buildObject } from '../utility';

export const schemaLoader = async (ctx: Ctx) => {
    await LoadSchema();
    const _nodes = buildObject(ctx.get(nodes).get(), (node) => [node.id, node.schema]);
    const _marks = buildObject(ctx.get(marks).get(), (mark) => [mark.id, mark.schema]);
    const _schema = ctx.get(schema);
    _schema.set(
        new Schema({
            nodes: _nodes,
            marks: _marks,
        }),
    );
    SchemaReady.done();
};
