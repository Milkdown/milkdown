import { Schema } from 'prosemirror-model';
import { createCtx } from '../context';
import { buildObject, MilkdownPlugin } from '../utility';
import { Initialize, Mark, Node } from '../internal-plugin';
import { createTiming } from '../timing';

export const SchemaReady = createTiming('schemaReady');

export const schemaCtx = createCtx<Schema>({} as Schema);
export const nodesCtx = createCtx<Node[]>([]);
export const marksCtx = createCtx<Mark[]>([]);

export const schema: MilkdownPlugin = (pre) => {
    pre.inject(schemaCtx).inject(nodesCtx).inject(marksCtx);

    return async (ctx) => {
        await Initialize();
        const nodes = buildObject(ctx.get(nodesCtx), ({ id, schema }) => [id, schema]);
        const marks = buildObject(ctx.get(marksCtx), ({ id, schema }) => [id, schema]);
        ctx.set(
            schemaCtx,
            new Schema({
                nodes,
                marks,
            }),
        );
        SchemaReady.done();
    };
};
