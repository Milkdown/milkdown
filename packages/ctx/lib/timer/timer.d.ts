import type { TimerMap } from './clock';
export type TimerStatus = 'pending' | 'resolved' | 'rejected';
export declare class Timer {
    #private;
    readonly type: TimerType;
    constructor(clock: TimerMap, type: TimerType);
    get status(): TimerStatus;
    start: () => Promise<void>;
    done: () => void;
}
export declare class TimerType {
    readonly id: symbol;
    readonly name: string;
    readonly timeout: number;
    constructor(name: string, timeout?: number);
    create: (clock: TimerMap) => Timer;
}
export declare const createTimer: (name: string, timeout?: number) => TimerType;
//# sourceMappingURL=timer.d.ts.map