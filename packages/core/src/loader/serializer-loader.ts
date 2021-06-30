import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { createSerializer, InnerSerializerSpecMap } from '../serializer';
import { buildObject } from '../utility';

export class SerializerLoader extends Atom<LoadState.SchemaReady> {
    override readonly id = 'serializerLoader';
    override readonly loadAfter = LoadState.SchemaReady;
    override main() {
        const children = [
            ...this.context.nodes.map((node) => ({ ...node, is: 'node' })),
            ...this.context.marks.map((node) => ({ ...node, is: 'mark' })),
        ];
        const spec = buildObject(children, (child) => [
            child.id,
            { ...child.serializer, is: child.is },
        ]) as InnerSerializerSpecMap;
        const serializer = createSerializer(this.context.schema, spec, this.context.remark);
        this.updateContext({ serializer });
    }
}
