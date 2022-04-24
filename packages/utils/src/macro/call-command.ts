/* Copyright 2021, Milkdown by Mirone. */
import { CmdKey, commandsCtx, Ctx } from '@milkdown/core';

type InferParams<T> = T extends CmdKey<infer U> ? U : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function callCommand<T extends CmdKey<any>>(slice: string, payload?: InferParams<T>): (ctx: Ctx) => boolean;
export function callCommand<T>(slice: CmdKey<T>, payload?: T): (ctx: Ctx) => boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function callCommand(slice: string | CmdKey<any>, payload?: any): (ctx: Ctx) => boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function callCommand(slice: string | CmdKey<any>, payload?: any): (ctx: Ctx) => boolean {
    return (ctx: Ctx) => {
        return ctx.get(commandsCtx).call(slice, payload);
    };
}
