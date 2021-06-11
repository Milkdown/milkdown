import type { Atom } from '@milkdown/core';
import { marks } from './mark';
import { nodes } from './node';

export * from './node';
export * from './mark';

type Cls = new (...args: unknown[]) => unknown;
type ConstructorOf<T> = T extends InstanceType<infer U> ? U : T;

class NodeList<T extends Atom = Atom> extends Array<T> {
    configure<U extends ConstructorOf<T>>(Target: U, config: ConstructorParameters<U>[0]): this {
        const index = this.findIndex((x) => x.constructor === Target);
        if (index < 0) return this;

        this.splice(index, 1, new (Target as Cls & U)(config));

        return this;
    }

    static create<T extends Atom = Atom>(from: T[]): NodeList {
        return new NodeList(...from);
    }
}

export const commonmark = NodeList.create([...nodes, ...marks]);
