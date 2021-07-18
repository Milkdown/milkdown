import type { Context, Meta } from '../context';
import type { Editor } from '../editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type Ctx = {
    use: <T>(meta: Meta<T>) => Context<T>;
};
export type Pre = {
    inject: <T>(meta: Meta<T>) => Editor;
};

export type MilkdownPlugin = {
    (pre: Pre): (ctx: Ctx) => void | Promise<void>;
};
