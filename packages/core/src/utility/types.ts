import type { Context, Meta } from '../context';
import type { Mark, Node } from '../internal-plugin';
import { Timer } from '../timing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type Ctx = {
    use: <T>(meta: Meta<T>) => Context<T>;
    get: <T>(meta: Meta<T>) => T;
    set: <T>(meta: Meta<T>, value: T) => void;
    update: <T>(meta: Meta<T>, updater: (prev: T) => T) => void;

    wait: (timer: Timer) => Promise<void>;
    done: (timer: Timer) => void;
    waitTimers: (meta: Meta<Timer[]>) => Promise<void>;
};

export type Pre = {
    inject: <T>(meta: Meta<T>, resetValue?: T) => Pre;
    record: (record: Timer) => Pre;
};

export type CtxHandler = (ctx: Ctx) => void | Promise<void>;

export type MilkdownPlugin = {
    (pre: Pre): CtxHandler;
};

export type Configure = CtxHandler;

export type Atom = Mark | Node;
