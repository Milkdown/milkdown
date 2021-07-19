import type { NodeView } from 'prosemirror-view';
import { createCtx, MarkViewParams, NodeViewParams } from '..';
import { MilkdownPlugin } from '../utility';
import { editorCtx } from './init';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export const nodeViewCtx = createCtx<Record<string, (...args: NodeViewParams | MarkViewParams) => NodeView>>({});

export const nodeView: MilkdownPlugin = () => async (ctx) => {
    await SchemaReady();
    const nodes = ctx.get(nodesCtx);
    const marks = ctx.get(marksCtx);
    const schema = ctx.get(schemaCtx);
    const editor = ctx.get(editorCtx);

    const nodeViewMap = nodes
        .filter((node) => Boolean(node.view))
        .reduce((acc, cur) => {
            const { view } = cur;
            const node = schema.nodes[cur.id];
            if (!node || !view) return acc;
            return {
                ...acc,
                [cur.id]: (...args: NodeViewParams) => view(editor, node, ...args),
            };
        }, {});

    const markViewMap = marks
        .filter((mark) => Boolean(mark.view))
        .reduce((acc, cur) => {
            const { view } = cur;
            const mark = schema.marks[cur.id];
            if (!mark || !view) return acc;
            return {
                ...acc,
                [cur.id]: (...args: MarkViewParams) => view(editor, mark, ...args),
            };
        }, {});

    const nodeView = { ...nodeViewMap, ...markViewMap };

    ctx.set(nodeViewCtx, nodeView);
};
