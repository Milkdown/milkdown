import { fromPairs } from 'lodash-es';
import { createCtx } from '..';
import { createTiming } from '../timing';
import { Atom, getAtom, MilkdownPlugin, ProseView, ViewFactory, ViewParams } from '../utility';
import { editorCtx } from './init';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export const nodeViewCtx = createCtx<Record<string, ProseView>>({});
export const NodeViewReady = createTiming('NodeViewReady');

export const nodeView: MilkdownPlugin = (pre) => {
    pre.inject(nodeViewCtx).record(NodeViewReady);

    return async (ctx) => {
        await ctx.wait(SchemaReady);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);
        const editor = ctx.get(editorCtx);

        const getViewMap = <T extends Atom>(atoms: T[], isNode: boolean) =>
            atoms
                .map(
                    ({ id, view }) =>
                        [getAtom(id, schema, isNode), { view: view as ViewFactory | undefined, id }] as const,
                )
                .map(([atom, { id, view }]) =>
                    atom && view
                        ? [id, ((...args: ViewParams) => view(editor, atom, ...args)) as ProseView]
                        : undefined,
                )
                .filter((x): x is [string, ProseView] => !!x);

        const nodeViewMap = getViewMap(nodes, true);

        const markViewMap = getViewMap(marks, false);

        const nodeView = fromPairs([...nodeViewMap, ...markViewMap]);

        ctx.set(nodeViewCtx, nodeView);
        ctx.done(NodeViewReady);
    };
};
