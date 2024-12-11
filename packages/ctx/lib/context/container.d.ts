import type { Slice, SliceType } from './slice';
export type SliceMap = Map<symbol, Slice>;
export declare class Container {
    sliceMap: SliceMap;
    get: <T, N extends string = string>(slice: SliceType<T, N> | N) => Slice<T, N>;
    remove: <T, N extends string = string>(slice: SliceType<T, N> | N) => void;
    has: <T, N extends string = string>(slice: SliceType<T, N> | N) => boolean;
}
//# sourceMappingURL=container.d.ts.map