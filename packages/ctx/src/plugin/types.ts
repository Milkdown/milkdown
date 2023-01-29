/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from './ctx'

export type Cleanup = () => void | Promise<void>

export type RunnerReturnType = void | Promise<void> | Cleanup | Promise<Cleanup>

export type CtxRunner = () => RunnerReturnType

export type MilkdownPlugin = (ctx: Ctx) => CtxRunner
