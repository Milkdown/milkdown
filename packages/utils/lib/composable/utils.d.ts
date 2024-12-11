import type { Cleanup, Ctx, MilkdownPlugin, SliceType, TimerType } from '@milkdown/ctx';
export declare const nanoid: (size?: number) => string;
export type WithTimer<T> = T & {
    timer: TimerType;
};
export declare function addTimer<T extends MilkdownPlugin, PluginWithTimer extends T = WithTimer<T>>(runner: (ctx: Ctx, plugin: PluginWithTimer, done: () => void) => Promise<void | Cleanup>, injectTo: SliceType<TimerType[], string>, timerName?: string): PluginWithTimer;
//# sourceMappingURL=utils.d.ts.map