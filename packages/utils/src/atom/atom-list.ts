/* Copyright 2021, Milkdown by Mirone. */

import { MilkdownPlugin } from '@milkdown/core';

import { AddMetadata, Metadata } from '../types';

type PluginWithMetadata = MilkdownPlugin & Metadata;
type Plugin = MilkdownPlugin | PluginWithMetadata;

const hasMetadata = (x: Plugin): x is PluginWithMetadata => Object.prototype.hasOwnProperty.call(x, 'origin');

type Factory = AddMetadata;

export class AtomList<T extends Plugin = Plugin> extends Array<T> {
    private findThenRun<U extends Factory>(target: U, callback: (index: number) => void): this {
        const index = this.findIndex((x) => hasMetadata(x) && x.origin === target);
        if (index < 0) return this;

        callback(index);

        return this;
    }

    configure<U extends Factory>(target: U, config: Parameters<U>[0]): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1, target(config) as T);
        });
    }

    replace<U extends Factory, Next extends Plugin>(target: U, next: Next): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1, next as Plugin as T);
        });
    }

    remove<U extends Factory>(target: U): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1);
        });
    }

    headless(): this {
        this.filter(hasMetadata).forEach((x) => {
            this.configure((x as PluginWithMetadata).origin as Factory, { headless: true });
        });
        return this;
    }

    static create<T extends Plugin = Plugin>(from: T[]): AtomList<T> {
        return new AtomList(...from);
    }
}
