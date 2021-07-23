import { fromPairs } from 'lodash-es';
import type { Node as ProsemirrorNode } from 'prosemirror-model';
import { marksCtx, nodesCtx, remarkCtx, schemaCtx, SchemaReady } from '..';
import { createCtx } from '../context';
import { createSerializer } from '../serializer';
import { createTiming, Timer } from '../timing';
import { MilkdownPlugin } from '../utility';

export const serializerCtx = createCtx<(node: ProsemirrorNode) => string>(() => '');
export const serializerTimerCtx = createCtx<Timer[]>([]);

export const SerializerReady = createTiming('SerializerReady');

export const serializer: MilkdownPlugin = (pre) => {
    pre.inject(serializerCtx).inject(serializerTimerCtx, [SchemaReady]).record(SerializerReady);

    return async (ctx) => {
        await Promise.all(ctx.get(serializerTimerCtx).map((x) => ctx.wait(x)));
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
