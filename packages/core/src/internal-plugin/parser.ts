import { SchemaReady } from '../constant';
import { marksCtx, nodesCtx, parserCtx, remarkCtx, schemaCtx } from '../context';
import { Ctx } from '../editor';
import { createParser, InnerParserSpecMap } from '../parser';
import { buildObject } from '../utility';

export const parserPlugin = async (ctx: Ctx) => {
    await SchemaReady();
    const _nodes = ctx.use(nodesCtx).get();
    const _marks = ctx.use(marksCtx).get();
    const _remark = ctx.use(remarkCtx).get();
    const _schema = ctx.use(schemaCtx).get();
    const _parser = ctx.use(parserCtx);

    const children = [
        ..._nodes.map((node) => ({ ...node, is: 'node' })),
        ..._marks.map((mark) => ({ ...mark, is: 'mark' })),
    ];
    const spec: InnerParserSpecMap = buildObject(children, (child) => [
        child.id,
        { ...child.parser, is: child.is },
    ]) as InnerParserSpecMap;

    _parser.set(createParser(_schema, spec, _remark));
};
