import type { Node, Mark } from '../abstract';
import type { SchemaReadyContext, PluginReadyContext } from '../editor';

import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { MarkView, NodeView } from '../utility';

export class NodeViewsLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    id = 'nodeViewsLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.SchemaReady;
    main() {
        const { nodes, marks, schema, editor } = this.context;
        const nodeViewMap = nodes
            .filter((node) => Boolean(node.view))
            .reduce((acc, cur) => {
                const node = schema.nodes[cur.id];
                if (!node) throw new Error();
                return {
                    ...acc,
                    [cur.id]: (...args: Parameters<NodeView>) => (cur as Required<Node>).view(editor, node, ...args),
                };
            }, {});

        const markViewMap = marks
            .filter((mark) => Boolean(mark.view))
            .reduce((acc, cur) => {
                const mark = schema.marks[cur.id];
                if (!mark) throw new Error();
                return {
                    ...acc,
                    [cur.id]: (...args: Parameters<MarkView>) => (cur as Required<Mark>).view(editor, mark, ...args),
                };
            }, {});

        const nodeViews = { ...nodeViewMap, ...markViewMap };

        this.updateContext({ nodeViews });
    }
}
