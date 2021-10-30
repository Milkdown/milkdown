/* Copyright 2021, Milkdown by Mirone. */
import { MilkdownPlugin } from '@milkdown/core';

import { Origin, PluginWithMetadata } from '../types';

type Atom = PluginWithMetadata;
type Plugin = Atom | MilkdownPlugin;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOrigin = Origin<any, any, any>;

const isAtom = (x: Plugin): x is Atom => Object.prototype.hasOwnProperty.call(x, 'origin');

export class AtomList<T extends Plugin = Plugin> extends Array<T> {
    private findThenRun<U extends AnyOrigin>(target: U, callback: (index: number) => void): this {
        const index = this.findIndex((x) => isAtom(x) && x.origin === target);
        if (index < 0) return this;

        callback(index);

        return this;
    }

    configure<U extends AnyOrigin>(target: U, config: Parameters<U>[0]): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1, target(config) as T);
        });
    }

    replace<U extends AnyOrigin, Next extends Plugin>(target: U, next: Next): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1, next as Plugin as T);
        });
    }

    remove<U extends AnyOrigin>(target: U): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1);
        });
    }

    headless(): this {
        this.filter(isAtom).forEach((x) => {
            this.configure((x as Atom).origin, { headless: true });
        });
        return this;
    }

    static create<T extends Plugin = Plugin>(from: T[]): AtomList<T> {
        return new AtomList(...from);
    }
}
