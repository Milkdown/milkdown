import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { createSerializer } from '../serializer';
import { buildObject } from '../utility';
import { SchemaReadyContext, PluginReadyContext } from '../editor';

export class SerializerLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    override id = 'serializerLoader';
    override loadAfter = LoadState.SchemaReady;
    override main() {
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
