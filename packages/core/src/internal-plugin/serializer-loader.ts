import { SchemaReady } from '..';
import { Complete } from '../constant';
import { marks, nodes, remark, schema, serializer } from '../context';
import { Ctx } from '../editor';
import { createSerializer, InnerSerializerSpecMap } from '../serializer';
import { buildObject } from '../utility';

export const serializerLoader = async (ctx: Ctx) => {
    await SchemaReady();
    const _nodes = ctx.get(nodes).get();
    const _marks = ctx.get(marks).get();
    const _remark = ctx.get(remark).get();
    const _schema = ctx.get(schema).get();
    const _serializer = ctx.get(serializer);

    const children = [
        ..._nodes.map((node) => ({ ...node, is: 'node' })),
        ..._marks.map((mark) => ({ ...mark, is: 'mark' })),
    ];
    const spec = buildObject(children, (child) => [
        child.id,
        { ...child.serializer, is: child.is },
    ]) as InnerSerializerSpecMap;

    _serializer.set(createSerializer(_schema, spec, _remark));

    Complete.done();
};
