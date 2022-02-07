/* Copyright 2021, Milkdown by Mirone. */

import { createContainer, createSlice, Slice } from '@milkdown/ctx';

export type ThemeSlice<Ret = unknown, T = undefined> = (info?: T) => Ret | undefined;
export type ThemeSliceKey<Ret = unknown, T = undefined> = Slice<ThemeSlice<Ret, T>>;

export const createThemeSliceKey = <Ret, T = undefined>(key = 'themeComponentKey'): ThemeSliceKey<Ret, T> =>
    createSlice((() => null as unknown as Ret) as ThemeSlice<Ret, T>, key);

export type ThemeManager = {
    inject: <Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T>) => void;
    set: <Ret = unknown, T = undefined>(meta: ThemeSliceKey<Ret, T> | string, value: ThemeSlice<Ret, T>) => void;
    get: <Ret = unknown, T = undefined>(meta: ThemeSliceKey<Ret, T> | string, info?: T) => Ret | undefined;
    setCustom: <Ret = unknown, T = undefined>(meta: ThemeSliceKey<Ret, T> | string, value: ThemeSlice<Ret, T>) => void;
};

export const themeManagerCtx = createSlice<ThemeManager>({} as ThemeManager, 'themeManager');

export const createThemeManager = () => {
    const container = createContainer();
    const lazyMap: Map<string, ThemeSlice> = new Map();
    const themeManager: ThemeManager = {
        inject: (slice) => slice(container.sliceMap),
        set: (slice, value) => {
            const meta = typeof slice === 'string' ? container.getSliceByName(slice) : container.getSlice(slice);
            if (!meta) return;

            return meta.set(value);
        },
        get: <Ret, T>(slice: ThemeSliceKey<Ret, T> | string, info?: T): Ret | undefined => {
            const key = typeof slice === 'string' ? slice : slice.sliceName;
            const lazyGet = lazyMap.get(key);
            if (lazyGet) {
                themeManager.set(key, lazyGet);
            }

            const meta =
                typeof slice === 'string'
                    ? container.getSliceByName<ThemeSlice<Ret, T>>(slice)
                    : container.getSlice(slice);
            if (!meta) return;

            return meta.get()(info);
        },
        setCustom: (slice, value) => {
            const key = typeof slice === 'string' ? slice : slice.sliceName;
            lazyMap.set(key, value as unknown as ThemeSlice);
        },
    };

    return themeManager;
};
