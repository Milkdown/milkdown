/* Copyright 2021, Milkdown by Mirone. */
import { createContainer, createSlice, Slice } from '@milkdown/ctx';

export type ThemeSlice<Ret = unknown, T = undefined> = (info?: T) => Ret | undefined | null;
export type ThemeSliceKey<Ret = unknown, T = undefined> = Slice<ThemeSlice<Ret, T>>;

export const createThemeSliceKey = <Ret, T = undefined>(key = 'themeComponentKey'): ThemeSliceKey<Ret, T> =>
    createSlice((() => null as unknown as Ret) as ThemeSlice<Ret, T>, key);

export type ThemeManager = {
    inject: <Ret, T>(key: ThemeSliceKey<Ret, T>) => void;
    set: <Ret, T>(meta: ThemeSliceKey<Ret, T> | string, value: ThemeSlice<Ret, T>) => void;
    get: <Ret, T>(meta: ThemeSliceKey<Ret, T> | string, info?: T) => Ret | undefined | null;
};

export const themeManagerCtx = createSlice<ThemeManager>({} as ThemeManager, 'themeManager');

export const createThemeManager = () => {
    const container = createContainer();
    const themeManager: ThemeManager = {
        inject: (slice) => slice(container.sliceMap),
        set: (slice, value) => {
            const meta = typeof slice === 'string' ? container.getSliceByName(slice) : container.getSlice(slice);
            if (!meta) return;

            return meta.set(value);
        },
        get: <Ret, T>(slice: ThemeSliceKey<Ret, T> | string, info?: T): Ret | undefined | null => {
            const meta =
                typeof slice === 'string'
                    ? container.getSliceByName<ThemeSlice<Ret, T>>(slice)
                    : container.getSlice(slice);
            if (!meta) return;

            return meta.get()(info);
        },
    };

    return themeManager;
};
