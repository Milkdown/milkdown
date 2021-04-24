import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { createSerializer } from '../serializer';
import { buildObject } from '../utility';
import { SchemaReadyContext, PluginReadyContext } from '../editor';

export class SerializerLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    id = 'serializerLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.SchemaReady;
    main() {
        const nodes = buildObject(this.context.nodes, (node) => [node.id, node.serializer], {
            text(state, node) {
                const { text } = node;
                if (!text) return;
                state.text(text);
            },
        });
        const marks = buildObject(this.context.marks, (mark) => [mark.id, mark.serializer]);
        const serializer = createSerializer(nodes, marks);
        this.updateContext({ serializer });
    }
}
