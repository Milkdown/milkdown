import { Schema } from 'prosemirror-model';
import { LoadSchema, SchemaReady } from '../constant';
import { marksCtx, nodesCtx, schemaCtx } from '../context';
import { Ctx } from '../editor';
import { buildObject } from '../utility';

export const schemaLoader = async (ctx: Ctx) => {
    await LoadSchema();
    const nodes = buildObject(ctx.use(nodesCtx).get(), (node) => [node.id, node.schema]);
    const marks = buildObject(ctx.use(marksCtx).get(), (mark) => [mark.id, mark.schema]);
    const schema = ctx.use(schemaCtx);
    schema.set(
        new Schema({
            nodes,
            marks,
        }),
    );
    SchemaReady.done();
};
