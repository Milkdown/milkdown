import type { Cmd, CmdKey } from '@milkdown/core';
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
export type $Command<T> = MilkdownPlugin & {
    run: (payload?: T) => boolean;
    key: CmdKey<T>;
};
export declare function $command<T, K extends string>(key: K, cmd: (ctx: Ctx) => Cmd<T>): $Command<T>;
export declare function $commandAsync<T, K extends string>(key: K, cmd: (ctx: Ctx) => Promise<Cmd<T>>, timerName?: string): import("./utils").WithTimer<$Command<T>>;
//# sourceMappingURL=$command.d.ts.map