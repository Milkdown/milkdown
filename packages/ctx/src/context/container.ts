/* Copyright 2021, Milkdown by Mirone. */
import { contextNotFound } from '@milkdown/exception';

import { $Slice, Slice } from './slice';

export type Container = {
    readonly getSlice: <T>(slice: Slice<T>) => $Slice<T>;
    readonly getSliceByName: <T>(name: string) => $Slice<T> | null;
    readonly sliceMap: Map<symbol, $Slice>;
};

export const createContainer = (): Container => {
    const sliceMap: Map<symbol, $Slice> = new Map();

    const getSlice = <T>(slice: Slice<T>): $Slice<T> => {
        const context = sliceMap.get(slice.id);
        if (!context) {
            throw contextNotFound(slice.sliceName);
        }
        return context as $Slice<T>;
    };

    const getSliceByName = <T>(sliceName: string): $Slice<T> | null => {
        const result = [...sliceMap.values()].find((x) => x.name === sliceName);
        if (!result) {
            return null;
        }
        return result as $Slice<T>;
    };

    return { getSlice, sliceMap, getSliceByName };
};
