/* Copyright 2021, Milkdown by Mirone. */

import { MilkdownPlugin } from '@milkdown/core';

import { AddMetadata, Metadata } from '../types';

export type MilkdownPluginWithMetadata = MilkdownPlugin & Metadata;
export type AtomPlugin = MilkdownPlugin | MilkdownPluginWithMetadata;

const hasMetadata = (x: AtomPlugin): x is MilkdownPluginWithMetadata =>
    Object.prototype.hasOwnProperty.call(x, 'origin');

export class AtomList<T extends AtomPlugin = AtomPlugin> extends Array<T> {
    private findThenRun<U extends AddMetadata>(target: U, callback: (index: number) => void): this {
        const index = this.findIndex((x) => hasMetadata(x) && x.origin === target);
        if (index < 0) return this;

        callback(index);

        return this;
    }

    configure<U extends AddMetadata>(target: U, config: Parameters<U>[0]): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1, target(config) as T);
        });
    }

    replace<U extends AddMetadata, Next extends AtomPlugin>(target: U, next: Next): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1, next as AtomPlugin as T);
        });
    }

    remove<U extends AddMetadata>(target: U): this {
        return this.findThenRun(target, (index) => {
            this.splice(index, 1);
        });
    }

    headless(): this {
        this.filter(hasMetadata).forEach((x) => {
            this.configure((x as MilkdownPluginWithMetadata).origin as AddMetadata, { headless: true });
        });
        return this;
    }

    static create<T extends AtomPlugin = AtomPlugin>(from: T[]): AtomList<T> {
        return new AtomList(...from);
    }
}
