/* Copyright 2021, Milkdown by Mirone. */

import { createContainer, createSlice, Slice } from '@milkdown/ctx';

export type ThemeSlice<Ret = unknown, T = undefined> = (info: T) => Ret | undefined;
export type ThemeSliceKey<Ret = unknown, T = undefined> = Slice<ThemeSlice<Ret, T>>;

export const createThemeSliceKey = <Ret, T = undefined>(key = 'themeComponentKey'): ThemeSliceKey<Ret, T> =>
    createSlice((() => null as unknown as Ret) as ThemeSlice<Ret, T>, key);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetRet<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<infer Ret, any> ? Ret : unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetT<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, infer T> ? T : undefined;

export type ThemeManager = {
    inject: <Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T>) => void;
    get: {
        <Ret = unknown>(meta: ThemeSliceKey<Ret, undefined> | string): Ret;
        <Ret = unknown, T = undefined>(meta: ThemeSliceKey<Ret, T> | string, info: T): Ret;
    };
    set: <Ret = unknown, T = undefined>(meta: ThemeSliceKey<Ret, T> | string, value: ThemeSlice<Ret, T>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCustom: <Key extends ThemeSliceKey<any, any>, Ret = GetRet<Key>, T = GetT<Key>>(
        meta: Key | string,
        value: ThemeSlice<Ret, T>,
    ) => void;
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
        get: ((slice, info) => {
            const key = typeof slice === 'string' ? slice : slice.sliceName;
            const lazyGet = lazyMap.get(key);
            if (lazyGet) {
                themeManager.set(key, lazyGet);
            }

            const meta = typeof slice === 'string' ? container.getSliceByName(slice) : container.getSlice(slice);
            if (!meta) return;

            // eslint-disable-next-line @typescript-eslint/ban-types
            return (meta.get() as Function)(info);
        }) as ThemeManager['get'],
        setCustom: (slice, value) => {
            const key = typeof slice === 'string' ? slice : slice.sliceName;
            lazyMap.set(key, value as unknown as ThemeSlice);
        },
    };

    return themeManager;
};
