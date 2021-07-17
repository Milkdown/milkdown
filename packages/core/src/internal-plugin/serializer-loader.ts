import { SchemaReady } from '..';
import { Complete } from '../constant';
import { marksCtx, nodesCtx, remarkCtx, schemaCtx, serializerCtx } from '../context';
import { Ctx } from '../editor';
import { createSerializer, InnerSerializerSpecMap } from '../serializer';
import { buildObject } from '../utility';

export const serializerLoader = async (ctx: Ctx) => {
    await SchemaReady();
    const nodes = ctx.use(nodesCtx).get();
    const marks = ctx.use(marksCtx).get();
    const remark = ctx.use(remarkCtx).get();
    const schema = ctx.use(schemaCtx).get();
    const serializer = ctx.use(serializerCtx);

    const children = [
        ...nodes.map((node) => ({ ...node, is: 'node' })),
        ...marks.map((mark) => ({ ...mark, is: 'mark' })),
    ];
    const spec = buildObject(children, (child) => [
        child.id,
        { ...child.serializer, is: child.is },
    ]) as InnerSerializerSpecMap;

    serializer.set(createSerializer(schema, spec, remark));

    Complete.done();
};
