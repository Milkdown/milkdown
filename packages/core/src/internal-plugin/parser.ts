import type { Node as ProsemirrorNode } from 'prosemirror-model';

import { SchemaReady } from '../constant';
import { createCtx } from '../context';
import { createParser, InnerParserSpecMap } from '../parser';
import { buildObject, MilkdownPlugin } from '../utility';
import { marksCtx, nodesCtx, schemaCtx } from './schema';
import type { RemarkOptions } from 'remark';
import re from 'remark';
import type { Processor } from 'unified';

export const parserCtx = createCtx<(text: string) => ProsemirrorNode | null>(() => null);
export const remarkCtx = createCtx<Processor<RemarkOptions>>(re());

export const parser: MilkdownPlugin = (editor) => {
    editor.ctx(parserCtx).ctx(remarkCtx);

    return async (ctx) => {
        await SchemaReady();
        const nodes = ctx.use(nodesCtx).get();
        const marks = ctx.use(marksCtx).get();
        const remark = ctx.use(remarkCtx).get();
        const schema = ctx.use(schemaCtx).get();
        const parser = ctx.use(parserCtx);

        const children = [
            ...nodes.map((node) => ({ ...node, is: 'node' })),
            ...marks.map((mark) => ({ ...mark, is: 'mark' })),
        ];
        const spec: InnerParserSpecMap = buildObject(children, (child) => [
            child.id,
            { ...child.parser, is: child.is },
        ]) as InnerParserSpecMap;

        parser.set(createParser(schema, spec, remark));
    };
};
