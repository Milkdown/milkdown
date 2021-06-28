import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { createSerializer, InnerSerializerSpecMap } from '../serializer';
import { buildObject } from '../utility';

export class SerializerLoader extends Atom<LoadState.SchemaReady> {
    override readonly id = 'serializerLoader';
    override readonly loadAfter = LoadState.SchemaReady;
    override main() {
        // const nodes = buildObject(this.context.nodes, (node) => [node.id, node.serializer], {
        //     text(state, node) {
        //         const { text } = node;
        //         if (!text) return;
        //         state.text(text);
        //     },
        // });
        // const nodes = buildObject(this.context.nodes, (node) => [node.id, node.serializer]);
        // const marks = buildObject(this.context.marks, (mark) => [mark.id, mark.serializer]);
        const children = [
            ...this.context.nodes.map((node) => ({ ...node, is: 'node' })),
            ...this.context.marks.map((node) => ({ ...node, is: 'mark' })),
        ];
        const spec = buildObject(children, (child) => [
            child.id,
            { ...child.serializer, is: child.is },
        ]) as InnerSerializerSpecMap;
        const serializer = createSerializer(spec);
        this.updateContext({ serializer });
    }
}
