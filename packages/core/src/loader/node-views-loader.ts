import type { SchemaReadyContext, PluginReadyContext } from '../editor';

import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { MarkView, NodeView } from '../utility';

export class NodeViewsLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    override id = 'nodeViewsLoader';
    override loadAfter = LoadState.SchemaReady;
    override main() {
        const { nodes, marks, schema, editor } = this.context;
        const nodeViewMap = nodes
            .filter((node) => Boolean(node.view))
            .reduce((acc, cur) => {
                const { view } = cur;
                const node = schema.nodes[cur.id];
                if (!node || !view) return acc;
                return {
                    ...acc,
                    [cur.id]: (...args: Parameters<NodeView>) => view(editor, node, ...args),
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
                    [cur.id]: (...args: Parameters<MarkView>) => view(editor, mark, ...args),
                };
            }, {});

        const nodeViews = { ...nodeViewMap, ...markViewMap };

        this.updateContext({ nodeViews });
    }
}
