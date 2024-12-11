import type { SliceMap } from './container';
export declare class Slice<T = any, N extends string = string> {
    #private;
    readonly type: SliceType<T, N>;
    constructor(container: SliceMap, value: T, type: SliceType<T, N>);
    on(watcher: (value: T) => unknown): () => void;
    once(watcher: (value: T) => unknown): () => void;
    off(watcher: (value: T) => unknown): void;
    offAll(): void;
    set: (value: T) => void;
    get: () => T;
    update: (updater: (prev: T) => T) => void;
}
export declare class SliceType<T = any, N extends string = string> {
    readonly id: symbol;
    readonly name: N;
    readonly _typeInfo: () => T;
    readonly _defaultValue: T;
    constructor(value: T, name: N);
    create(container: SliceMap, value?: T): Slice<T, N>;
}
export declare const createSlice: <T = any, N extends string = string>(value: T, name: N) => SliceType<T, N>;
//# sourceMappingURL=slice.d.ts.map