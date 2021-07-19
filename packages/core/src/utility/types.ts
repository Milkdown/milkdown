import type { Context, Meta } from '../context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type Ctx = {
    use: <T>(meta: Meta<T>) => Context<T>;
    get: <T>(meta: Meta<T>) => T;
    set: <T>(meta: Meta<T>, value: T) => void;
};

export type Pre = {
    inject: <T>(meta: Meta<T>) => Pre;
};

export type CtxHandler = (ctx: Ctx) => void | Promise<void>;

export type MilkdownPlugin = {
    (pre: Pre): CtxHandler;
};

export type Configure = CtxHandler;
