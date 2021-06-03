import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { createParser } from '../parser';
import { buildObject } from '../utility';

export class ParserLoader extends Atom<LoadState.SchemaReady> {
    override readonly id = 'parserLoader';
    override readonly loadAfter = LoadState.SchemaReady;
    override main() {
        const children = [...this.context.nodes, ...this.context.marks];
        const spec = buildObject(children, (child) => [child.id, child.parser]);
        const parser = createParser(this.context.schema, this.context.markdownIt, spec);
        this.updateContext({ parser });
    }
}
