import { fromPairs } from 'lodash-es';
import type { Node as ProsemirrorNode } from 'prosemirror-model';
import { marksCtx, nodesCtx, remarkCtx, schemaCtx, SchemaReady } from '..';
import { createCtx } from '../context';
import { createSerializer } from '../serializer';
import { createTiming } from '../timing';
import { MilkdownPlugin } from '../utility';

export const serializerCtx = createCtx<(node: ProsemirrorNode) => string>(() => '');
export const SerializerReady = createTiming('SerializerReady');

export const serializer: MilkdownPlugin = (pre) => {
    pre.inject(serializerCtx).record(SerializerReady);

    return async (ctx) => {
        await ctx.wait(SchemaReady);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const remark = ctx.get(remarkCtx);
        const schema = ctx.get(schemaCtx);

        const children = [...nodes, ...marks];
        const spec = fromPairs(children.map((child) => [child.id, child.serializer]));

        ctx.set(serializerCtx, createSerializer(schema, spec, remark));
        ctx.done(SerializerReady);
    };
};
