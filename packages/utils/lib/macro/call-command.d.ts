import type { CmdKey } from '@milkdown/core';
import type { Ctx } from '@milkdown/ctx';
type InferParams<T> = T extends CmdKey<infer U> ? U : never;
export declare function callCommand<T extends CmdKey<any>>(slice: string, payload?: InferParams<T>): (ctx: Ctx) => boolean;
export declare function callCommand<T>(slice: CmdKey<T>, payload?: T): (ctx: Ctx) => boolean;
export declare function callCommand(slice: string | CmdKey<any>, payload?: any): (ctx: Ctx) => boolean;
export {};
//# sourceMappingURL=call-command.d.ts.map