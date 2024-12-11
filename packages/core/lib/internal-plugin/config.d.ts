import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
export type Config = (ctx: Ctx) => void | Promise<void>;
export declare const ConfigReady: import("@milkdown/ctx").TimerType;
export declare function config(configure: Config): MilkdownPlugin;
//# sourceMappingURL=config.d.ts.map