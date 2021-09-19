/* Copyright 2021, Milkdown by Mirone. */
import { contextNotFound } from '@milkdown/exception';

import { $Slice, Slice } from './slice';

export type Container = {
    readonly getSlice: <T>(slice: Slice<T>) => $Slice<T>;
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

    return { getSlice, sliceMap };
};
