/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, Pre } from '../editor';
import type { Mark, Node } from '../internal-plugin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type CtxHandler = (ctx: Ctx) => void | Promise<void>;

export type MilkdownPlugin = {
    (pre: Pre): CtxHandler;
};

export type Configure = CtxHandler;

export type Atom = Mark | Node;
