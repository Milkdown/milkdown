/* Copyright 2021, Milkdown by Mirone. */
import { ctxCallOutOfScope } from '@milkdown/exception';

import { shallowClone } from './shallow-clone';

export type $Slice<T = unknown> = {
    readonly id: symbol;
    readonly name: string;
    readonly set: (value: T) => void;
    readonly get: () => T;
    readonly update: (updater: (prev: T) => T) => void;
};

export type SliceMap = Map<symbol, $Slice>;

export type Slice<T> = {
    readonly id: symbol;
    readonly sliceName: string;
    readonly _typeInfo: () => T;
    (container: SliceMap, resetValue?: T): $Slice<T>;
};

export const createSlice = <T>(value: T, name: string): Slice<T> => {
    const id = Symbol('Context');

    const factory = (container: SliceMap, resetValue = shallowClone(value)) => {
        let inner = resetValue;

        const context: $Slice<T> = {
            name,
            id,
            set: (next) => {
                inner = next;
            },
            get: () => inner,
            update: (updater) => {
                inner = updater(inner);
            },
        };
        container.set(id, context as $Slice);
        return context;
    };
    factory.sliceName = name;
    factory.id = id;
    factory._typeInfo = (): T => {
        throw ctxCallOutOfScope();
    };

    return factory;
};
