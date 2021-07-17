import { SchemaReady } from '../constant';
import { marks, nodes, parser, remark, schema } from '../context';
import { Ctx } from '../editor';
import { createParser, InnerParserSpecMap } from '../parser';
import { buildObject } from '../utility';

export const parserPlugin = async (ctx: Ctx) => {
    await SchemaReady();
    const _nodes = ctx.get(nodes).get();
    const _marks = ctx.get(marks).get();
    const _remark = ctx.get(remark).get();
    const _schema = ctx.get(schema).get();
    const _parser = ctx.get(parser);

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
