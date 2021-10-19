/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from './ctx';
import type { Pre } from './pre';

export type CtxHandler = (ctx: Ctx) => void | Promise<void>;

export type MilkdownPlugin = {
    (pre: Pre): CtxHandler;
};
