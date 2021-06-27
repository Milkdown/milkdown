import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { createParser, SpecMap } from '../parser';
import { buildObject } from '../utility';

export class ParserLoader extends Atom<LoadState.SchemaReady> {
    override readonly id = 'parserLoader';
    override readonly loadAfter = LoadState.SchemaReady;
    override main() {
        const children = [
            ...this.context.nodes.map((node) => ({ ...node, is: 'node' })),
            ...this.context.marks.map((node) => ({ ...node, is: 'mark' })),
        ];
        const spec: SpecMap = buildObject(children, (child) => [
            child.id,
            { ...child.parser, is: child.is },
        ]) as SpecMap;
        const parser = createParser(this.context.schema, spec);
        this.updateContext({ parser });
    }
}
