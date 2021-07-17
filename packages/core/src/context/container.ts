export type Context<T = unknown> = {
    id: symbol;
    set: (value: T) => void;
    get: () => T;
};

export type Container = Map<symbol, Context>;

export type Meta<T> = {
    id: symbol;
    _typeInfo: () => T;
    (container: Container): void;
};

export const createCtx = <T>(value: T): Meta<T> => {
    const id = Symbol('Context');
    let inner = value;

    const context: Context<T> = {
        id,
        set: (next) => {
            inner = next;
        },
        get: () => inner,
    };

    const setter = (container: Container) => {
        container.set(id, context as Context);
    };
    setter.id = id;
    setter._typeInfo = (): T => {
        throw new Error('Should not call a context.');
    };

    return setter;
};

export const createContainer = () => {
    const container: Map<symbol, Context> = new Map();

    const getCtx = <T>(meta: Meta<T>): Context<T> => {
        return container.get(meta.id) as Context<T>;
    };

    return { getCtx, container };
};
