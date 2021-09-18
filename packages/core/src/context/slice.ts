/* Copyright 2021, Milkdown by Mirone. */
import { ctxCallOutOfScope } from '@milkdown/exception';
export type Context<T = unknown> = {
    id: symbol;
    set: (value: T) => void;
    get: () => T;
    update: (updater: (prev: T) => T) => void;
};

export type ContextMap = Map<symbol, Context>;

export type Slice<T> = {
    id: symbol;
    _typeInfo: () => T;
    (container: ContextMap, resetValue?: T): Context<T>;
};

const shallowClone = <T>(x: T): T => {
    if (Array.isArray(x)) {
        return [...(x as unknown[])] as unknown as T;
    }
    if (typeof x === 'object') {
        return { ...x };
    }
    return x;
};

export const createSlice = <T>(value: T): Slice<T> => {
    const id = Symbol('Context');

    const factory = (container: ContextMap, resetValue = shallowClone(value)) => {
        let inner = resetValue;

        const context: Context<T> = {
            id,
            set: (next) => {
                inner = next;
            },
            get: () => inner,
            update: (updater) => {
                inner = updater(inner);
            },
        };
        container.set(id, context as Context);
        return context;
    };
    factory.id = id;
    factory._typeInfo = (): T => {
        throw ctxCallOutOfScope();
    };

    return factory;
};
