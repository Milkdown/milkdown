import type { Node, Mark } from '../abstract';
import type { SchemaReadyContext, PluginReadyContext } from '../editor';

import { keymap } from 'prosemirror-keymap';
import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';

export class KeymapLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    id = 'keymapLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.SchemaReady;
    main() {
        const { nodes, marks, schema } = this.context;

        const nodesKeymap = nodes
            .filter((node) => Boolean(node.keymap))
            .map((cur) => {
                const node = schema.nodes[cur.id];
                if (!node) throw new Error();
                return (cur as Required<Node>).keymap(node);
            });
        const marksKeymap = marks
            .filter((mark) => Boolean(mark.keymap))
            .map((cur) => {
                const mark = schema.marks[cur.id];
                if (!mark) throw new Error();
                return (cur as Required<Mark>).keymap(mark);
            });

        const keymapList = [...nodesKeymap, ...marksKeymap].map((keys) => keymap(keys));

        this.updateContext({ keymap: keymapList });
    }
}
