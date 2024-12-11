import type { Container, SliceType } from '../context';
import type { Clock, TimerStatus, TimerType } from '../timer';
import type { Meta } from './meta';
export interface Telemetry {
    metadata: Meta;
    injectedSlices: {
        name: string;
        value: unknown;
    }[];
    consumedSlices: {
        name: string;
        value: unknown;
    }[];
    recordedTimers: {
        name: string;
        duration: number;
        status: TimerStatus;
    }[];
    waitTimers: {
        name: string;
        duration: number;
        status: TimerStatus;
    }[];
}
export declare class Inspector {
    #private;
    constructor(container: Container, clock: Clock, meta: Meta);
    read: () => Telemetry;
    readonly onRecord: (timerType: TimerType) => void;
    readonly onClear: (timerType: TimerType) => void;
    readonly onDone: (timerType: TimerType) => void;
    readonly onWait: (timerType: TimerType, promise: Promise<void>) => void;
    readonly onInject: (sliceType: SliceType | string) => void;
    readonly onRemove: (sliceType: SliceType | string) => void;
    readonly onUse: (sliceType: SliceType | string) => void;
}
//# sourceMappingURL=inspector.d.ts.map