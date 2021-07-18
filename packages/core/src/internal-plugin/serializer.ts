import type { Node as ProsemirrorNode } from 'prosemirror-model';
import { marksCtx, nodesCtx, remarkCtx, schemaCtx, SchemaReady } from '..';
import { Complete } from '../constant';
import { createCtx } from '../context';
import { createSerializer, InnerSerializerSpecMap } from '../serializer';
import { buildObject, MilkdownPlugin } from '../utility';

export const serializerCtx = createCtx<(node: ProsemirrorNode) => string>(() => '');

export const serializer: MilkdownPlugin = (editor) => {
    editor.ctx(serializerCtx);

    return async (ctx) => {
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
};
