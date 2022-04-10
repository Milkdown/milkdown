/* Copyright 2021, Milkdown by Mirone. */

import { createContainer, createSlice, Ctx, MilkdownPlugin, Pre, Slice } from '@milkdown/ctx';

import { emotionCtx } from './emotion';

export type ThemeSlice<Ret = unknown, T = undefined> = (info: T) => Ret | undefined;
export type ThemeSliceKey<Ret = unknown, T = undefined, K extends string = string> = Slice<ThemeSlice<Ret, T>, K>;

export const createThemeSliceKey = <Ret, T = undefined, K extends string = string>(key: K): ThemeSliceKey<Ret, T, K> =>
    createSlice((() => null as unknown as Ret) as ThemeSlice<Ret, T>, key);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetRet<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<infer Ret, any, any> ? Ret : unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetPayload<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, infer T, any> ? T : undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetKey<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, any, infer T> ? T : undefined;

export type ThemeManager = {
    inject: <Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T>) => void;
    get: <
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(
        key: Key | (K & string),
        payload: Payload,
    ) => Ret;
    set: <Ret = unknown, T = undefined>(meta: ThemeSliceKey<Ret, T> | string, value: ThemeSlice<Ret, T>) => void;
    setCustom: <
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(
        meta: Key | (K & string),
        themeSlice: ThemeSlice<Ret, Payload>,
    ) => void;

    onFlush: (fn: () => void, callWhenRegister?: boolean) => void;
    switch: (ctx: Ctx, theme: MilkdownPlugin) => Promise<void>;
};

export const themeManagerCtx = createSlice({} as ThemeManager, 'themeManager');

export const createThemeManager = () => {
    const container = createContainer();
    const lazyMap: Map<string, ThemeSlice> = new Map();
    const flushListener: Array<() => void> = [];
    const themeManager: ThemeManager = {
        inject: (slice) => slice(container.sliceMap),
        set: (slice, value) => {
            const meta = container.getSlice(slice);

            return meta.set(value);
        },
        get: ((slice, payload) => {
            const key = typeof slice === 'string' ? slice : slice.sliceName;
            const lazyGet = lazyMap.get(key);
            if (lazyGet) {
                themeManager.set(key, lazyGet);
            }

            const meta = container.getSlice(slice);
            if (!meta) return;

            return (meta.get() as (info: unknown) => unknown)(payload);
        }) as ThemeManager['get'],
        setCustom: (slice, themeSlice) => {
            const key = typeof slice === 'string' ? slice : slice.sliceName;
            lazyMap.set(key, themeSlice as ThemeSlice);
        },
        onFlush: (fn, callWhenRegister = true) => {
            flushListener.push(fn);
            if (callWhenRegister) {
                fn();
            }
        },
        switch: async (ctx, theme) => {
            const emotion = ctx.get(emotionCtx);
            emotion.flush();
            await theme(ctx as unknown as Pre)(ctx);
            flushListener.forEach((f) => f());
        },
    };

    return themeManager;
};
