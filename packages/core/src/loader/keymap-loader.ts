import type { Keymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Atom } from '../abstract';
import { LoadState } from '../constant';

export class KeymapLoader extends Atom<LoadState.SchemaReady> {
    override readonly id = 'keymapLoader';
    override readonly loadAfter = LoadState.SchemaReady;
    override main() {
        const { nodes, marks, schema } = this.context;

        const nodesKeymap = nodes.map((cur) => {
            const node = schema.nodes[cur.id];
            if (!node) throw new Error();
            return cur.keymap?.(node);
        });
        const marksKeymap = marks.map((cur) => {
            const mark = schema.marks[cur.id];
            if (!mark) throw new Error();
            return cur.keymap?.(mark);
        });

        const keymapList = [...nodesKeymap, ...marksKeymap]
            .filter((keys): keys is Keymap => Boolean(keys))
            .map((keys) => keymap(keys));

        this.updateContext({ keymap: keymapList });
    }
}
