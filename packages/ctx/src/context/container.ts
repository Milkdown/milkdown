/* Copyright 2021, Milkdown by Mirone. */
import { contextNotFound } from '@milkdown/exception';

import { $Slice, Slice } from './slice';

export type Container = {
    readonly getSlice: <T, N extends string = string>(slice: Slice<T, N> | N) => $Slice<T, N>;
    readonly sliceMap: Map<symbol, $Slice>;
};

export const createContainer = (): Container => {
    const sliceMap: Map<symbol, $Slice> = new Map();

    const getSlice = <T, N extends string = string>(slice: Slice<T, N> | N): $Slice<T, N> => {
        const context =
            typeof slice === 'string' ? [...sliceMap.values()].find((x) => x.name === slice) : sliceMap.get(slice.id);

        if (!context) {
            const name = typeof slice === 'string' ? slice : slice.sliceName;
            throw contextNotFound(name);
        }
        return context as $Slice<T, N>;
    };

    return { getSlice, sliceMap };
};
