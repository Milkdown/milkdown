/* Copyright 2021, Milkdown by Mirone. */
import { Container } from '../context';
import { Clock } from '../timing';
import { Ctx } from './ctx';
import { Pre } from './pre';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyMixins(derivedCtor: any, constructors: any[]) {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null),
            );
        });
    });
}

export interface Env extends Ctx, Pre {}
export class Env {
    constructor(protected readonly container: Container, protected readonly clock: Clock) {}
}

applyMixins(Env, [Ctx, Pre]);
