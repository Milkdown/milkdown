import type { Node as ProsemirrorNode } from 'prosemirror-model';
import re from 'remark';
import { createCtx, Meta } from '../context';
import { createParser, InnerParserSpecMap } from '../parser';
import { buildObject, MilkdownPlugin } from '../utility';
import { remarkPluginsCtx } from './remark-plugin-factory';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export type Parser = (text: string) => ProsemirrorNode | null;
export type RemarkParser = ReturnType<typeof re>;
export const parserCtx = createCtx<Parser>(() => null);
export const remarkCtx: Meta<RemarkParser> = createCtx<RemarkParser>(re());

export const parser: MilkdownPlugin = (pre) => {
    pre.inject(parserCtx).inject(remarkCtx);

    return async (ctx) => {
        await SchemaReady();
        const nodes = ctx.use(nodesCtx).get();
        const marks = ctx.use(marksCtx).get();
        const remark = ctx.use(remarkCtx).get();
        const schema = ctx.use(schemaCtx).get();
        const remarkPlugins = ctx.get(remarkPluginsCtx);

        const re = remarkPlugins.reduce((acc, plug) => {
            return acc.use(plug);
        }, remark);

        const children = [
            ...nodes.map((node) => ({ ...node, is: 'node' })),
            ...marks.map((mark) => ({ ...mark, is: 'mark' })),
        ];
        const spec: InnerParserSpecMap = buildObject(children, (child) => [
            child.id,
            { ...child.parser, is: child.is },
        ]) as InnerParserSpecMap;

        ctx.use(parserCtx).set(createParser(schema, spec, re));
    };
};
