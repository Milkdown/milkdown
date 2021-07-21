import type { Context, Meta } from '../context';
import type { Mark, Node } from '../internal-plugin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type Ctx = {
    use: <T>(meta: Meta<T>) => Context<T>;
    get: <T>(meta: Meta<T>) => T;
    set: <T>(meta: Meta<T>, value: T) => void;
    update: <T>(meta: Meta<T>, updater: (prev: T) => T) => void;
};

export type Pre = {
    inject: <T>(meta: Meta<T>, resetValue?: T) => Pre;
};

export type CtxHandler = (ctx: Ctx) => void | Promise<void>;

export type MilkdownPlugin = {
    (pre: Pre): CtxHandler;
};

export type Configure = CtxHandler;

export type Atom = Mark | Node;
