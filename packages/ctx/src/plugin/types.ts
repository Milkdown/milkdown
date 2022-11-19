/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from './ctx'
import type { Post } from './post'
import type { Pre } from './pre'

export type Cleanup = (post: Post) => void | Promise<void>

export type HandlerReturnType = void | Promise<void> | Cleanup | Promise<Cleanup>

export type CtxHandler = (ctx: Ctx) => HandlerReturnType

export type MilkdownPlugin = (pre: Pre) => CtxHandler
