import { cloneDeep } from 'lodash-es';
export type Context<T = unknown> = {
    id: symbol;
    set: (value: T) => void;
    get: () => T;
    update: (updater: (prev: T) => T) => void;
};

export type Container = Map<symbol, Context>;

export type Meta<T> = {
    id: symbol;
    _typeInfo: () => T;
    (container: Container, resetValue?: T): Context<T>;
};

export const createCtx = <T>(value: T): Meta<T> => {
    const id = Symbol('Context');
    const origin = cloneDeep(value);

    const factory = (container: Container, resetValue = origin) => {
        let inner = value;

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
        context.set(resetValue);
        return context;
    };
    factory.id = id;
    factory._typeInfo = (): T => {
        throw new Error('Should not call a context.');
    };

    return factory;
};
