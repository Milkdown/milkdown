import { Mark, MilkdownPlugin, Node } from '@milkdown/core';

import { UnknownRecord } from '../type-utility';
import { Origin, PluginWithMetadata } from './types';

type Atom = PluginWithMetadata<string, UnknownRecord, Node | Mark>;
type Plugin = Atom | MilkdownPlugin;

const isAtom = (x: Plugin): x is Atom => Object.prototype.hasOwnProperty.call(x, 'origin');

export class AtomList<T extends Plugin = Plugin> extends Array<T> {
    configure<U extends Origin>(target: U, config: Parameters<U>[0]): this {
        const index = this.findIndex((x) => isAtom(x) && x.origin === target);
        if (index < 0) return this;

        this.splice(index, 1, target(config) as T);

        return this;
    }

    headless(): this {
        this.filter(isAtom).forEach((x) => {
            this.configure((x as Atom).origin, { headless: true });
        });
        return this;
    }

    static create<T extends Plugin = Plugin>(from: T[]): AtomList {
        return new AtomList(...from);
    }
}
