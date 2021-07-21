import { fromPairs } from 'lodash-es';
import type { Node as ProsemirrorNode } from 'prosemirror-model';
import re from 'remark';
import { createCtx, Meta } from '../context';
import { createParser, InnerParserSpecMap, ParserSpecWithType } from '../parser';
import { createTiming } from '../timing';
import { MilkdownPlugin } from '../utility';
import { remarkPluginsCtx } from './remark-plugin-factory';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export type Parser = (text: string) => ProsemirrorNode | null;
export type RemarkParser = ReturnType<typeof re>;
export const parserCtx = createCtx<Parser>(() => null);
export const remarkCtx: Meta<RemarkParser> = createCtx<RemarkParser>(re());
export const ParserReady = createTiming('ParserReady');

export const parser: MilkdownPlugin = (pre) => {
    pre.inject(parserCtx).inject(remarkCtx, re());

    return async (ctx) => {
        await SchemaReady();
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const remark = ctx.get(remarkCtx);
        const schema = ctx.get(schemaCtx);
        const remarkPlugins = ctx.get(remarkPluginsCtx);

        const processor = remarkPlugins.reduce((acc, plug) => acc.use(plug), remark);

        const children = [
            ...nodes.map((node) => ({ ...node, is: 'node' as const })),
            ...marks.map((mark) => ({ ...mark, is: 'mark' as const })),
        ];
        const spec: InnerParserSpecMap = fromPairs(
            children.map(({ id, parser, is }) => [id, { ...parser, is, key: id } as ParserSpecWithType]),
        );

        ctx.set(parserCtx, createParser(schema, spec, processor));
        ParserReady.done();
    };
};
