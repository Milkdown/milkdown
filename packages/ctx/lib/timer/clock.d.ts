import type { Timer, TimerType } from './timer';
export type TimerMap = Map<symbol, Timer>;
export declare class Clock {
    readonly store: TimerMap;
    get: (timer: TimerType) => Timer;
    remove: (timer: TimerType) => void;
    has: (timer: TimerType) => boolean;
}
//# sourceMappingURL=clock.d.ts.map