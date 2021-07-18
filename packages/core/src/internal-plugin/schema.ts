import { Schema } from 'prosemirror-model';
import { Initialize, SchemaReady } from '../constant';
import { createCtx } from '../context';
import { buildObject, MilkdownPlugin } from '../utility';
import type { Mark, Node } from '../internal-plugin';

export const schemaCtx = createCtx<Schema>({} as Schema);
export const nodesCtx = createCtx<Node[]>([]);
export const marksCtx = createCtx<Mark[]>([]);

export const schema: MilkdownPlugin = (editor) => {
    editor.ctx(schemaCtx).ctx(nodesCtx).ctx(marksCtx);

    return async (ctx) => {
        await Initialize();
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
};
