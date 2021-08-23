import { Mark, Node } from '@milkdown/core';
import { Origin, PluginWithMetadata } from './types';

type Atom = PluginWithMetadata<Node | Mark>;

export class AtomList<T extends Atom = Atom> extends Array<T> {
    configure<U extends Origin<Node | Mark>>(target: U, config: Parameters<U>[0]): this {
        const index = this.findIndex((x) => x.origin === target);
        if (index < 0) return this;

        this.splice(index, 1, target(config) as T);

        return this;
    }

    headless(): this {
        this.forEach((x) => {
            this.configure(x.origin, { headless: true });
        });
        return this;
    }

    static create<T extends Atom = Atom>(from: T[]): AtomList {
        return new AtomList(...from);
    }
}
