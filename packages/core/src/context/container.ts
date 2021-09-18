/* Copyright 2021, Milkdown by Mirone. */
import { contextNotFound } from '@milkdown/exception';

import { Context, Slice } from './slice';

export const createContainer = () => {
    const contextMap: Map<symbol, Context> = new Map();

    const getCtx = <T>(slice: Slice<T>): Context<T> => {
        const context = contextMap.get(slice.id);
        if (!context) {
            throw contextNotFound();
        }
        return context as Context<T>;
    };

    return { getCtx, contextMap };
};

export type Container = ReturnType<typeof createContainer>;
