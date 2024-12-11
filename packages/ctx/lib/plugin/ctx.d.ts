import type { Container, Slice, SliceType } from '../context';
import type { Clock, TimerType } from '../timer';
import { Inspector } from '../inspector';
import type { Meta } from '../inspector';
export declare class Ctx {
    #private;
    constructor(container: Container, clock: Clock, meta?: Meta);
    get meta(): Meta | undefined;
    get inspector(): Inspector | undefined;
    readonly produce: (meta?: Meta) => Ctx;
    readonly inject: <T>(sliceType: SliceType<T>, value?: T) => this;
    readonly remove: <T, N extends string = string>(sliceType: SliceType<T, N> | N) => this;
    readonly record: (timerType: TimerType) => this;
    readonly clearTimer: (timerType: TimerType) => this;
    readonly isInjected: <T, N extends string = string>(sliceType: SliceType<T, N> | N) => boolean;
    readonly isRecorded: (timerType: TimerType) => boolean;
    readonly use: <T, N extends string = string>(sliceType: SliceType<T, N> | N) => Slice<T, N>;
    readonly get: <T, N extends string>(sliceType: SliceType<T, N> | N) => T;
    readonly set: <T, N extends string>(sliceType: SliceType<T, N> | N, value: T) => void;
    readonly update: <T, N extends string>(sliceType: SliceType<T, N> | N, updater: (prev: T) => T) => void;
    readonly timer: (timer: TimerType) => import("..").Timer;
    readonly done: (timer: TimerType) => void;
    readonly wait: (timer: TimerType) => Promise<void>;
    readonly waitTimers: (slice: SliceType<TimerType[]>) => Promise<void>;
}
//# sourceMappingURL=ctx.d.ts.map