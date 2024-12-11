import type { Ctx, MilkdownPlugin, SliceType } from '@milkdown/ctx';
import type { Command } from '@milkdown/prose/state';
export type Cmd<T = undefined> = (payload?: T) => Command;
export type CmdKey<T = undefined> = SliceType<Cmd<T>>;
type InferParams<T> = T extends CmdKey<infer U> ? U : never;
export declare class CommandManager {
    #private;
    setCtx: (ctx: Ctx) => void;
    get ctx(): Ctx | null;
    create<T>(meta: CmdKey<T>, value: Cmd<T>): import("@milkdown/ctx").Slice<Cmd<T>, string>;
    get<T extends CmdKey<any>>(slice: string): Cmd<InferParams<T>>;
    get<T>(slice: CmdKey<T>): Cmd<T>;
    get(slice: string | CmdKey<any>): Cmd<any>;
    remove<T extends CmdKey<any>>(slice: string): void;
    remove<T>(slice: CmdKey<T>): void;
    remove(slice: string | CmdKey<any>): void;
    call<T extends CmdKey<any>>(slice: string, payload?: InferParams<T>): boolean;
    call<T>(slice: CmdKey<T>, payload?: T): boolean;
    call(slice: string | CmdKey<any>, payload?: any): boolean;
}
export declare function createCmdKey<T = undefined>(key?: string): CmdKey<T>;
export declare const commandsCtx: SliceType<CommandManager, "commands">;
export declare const commandsTimerCtx: SliceType<import("@milkdown/ctx").TimerType[], "commandsTimer">;
export declare const CommandsReady: import("@milkdown/ctx").TimerType;
export declare const commands: MilkdownPlugin;
export {};
//# sourceMappingURL=commands.d.ts.map