/* Copyright 2021, Milkdown by Mirone. */

import { createContainer, createSlice, Ctx, MilkdownPlugin, Pre, Slice } from '@milkdown/ctx';

import { emotionCtx } from './emotion';

export type ThemeSlice<Ret = unknown, T = undefined> = (payload: T) => Ret | undefined;
export type ThemeSliceKey<Ret = unknown, T = undefined, K extends string = string> = Slice<ThemeSlice<Ret, T>, K>;

export const createThemeSliceKey = <Ret, T = undefined, K extends string = string>(key: K): ThemeSliceKey<Ret, T, K> =>
    createSlice((() => null as unknown as Ret) as ThemeSlice<Ret, T>, key);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetRet<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<infer Ret, any, any> ? Ret : unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetPayload<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, infer T, any> ? T : undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetKey<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, any, infer T> ? T : undefined;

export class ThemeManager {
    #container = createContainer();
    #cache: Map<string, ThemeSlice> = new Map();
    #flushListener: Array<() => void> = [];

    inject<Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T>): void {
        key(this.#container.sliceMap);
    }

    has(key: ThemeSliceKey | string): boolean {
        const name = typeof key === 'string' ? key : key.sliceName;
        if (this.#cache.has(name)) {
            return true;
        }

        const meta = this.#container.getSlice(key);

        return meta.get()(null as never) != null;
    }

    set<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(key: Key | (K & string), themeSlice: ThemeSlice<Ret, Payload>): void;
    set<Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T> | string, themeSlice: ThemeSlice<Ret, T>): void;
    set(key: ThemeSliceKey | string, themeSlice: ThemeSlice): void {
        const name = typeof key === 'string' ? key : key.sliceName;
        this.#cache.set(name, themeSlice as ThemeSlice);
    }

    get<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(key: Key | (K & string), payload: Payload): Ret {
        const name = typeof key === 'string' ? key : key.sliceName;
        const lazyGet = this.#cache.get(name);
        if (lazyGet) {
            const meta = this.#container.getSlice(key);
            meta.set(lazyGet);
            this.#cache.delete(key as string);
        }
        const meta = this.#container.getSlice(key);

        return meta.get()(payload) as Ret;
    }

    onFlush(fn: () => void, callWhenRegister = true): void {
        this.#flushListener.push(fn);
        if (callWhenRegister) {
            fn();
        }
    }

    async switch(ctx: Ctx, theme: MilkdownPlugin) {
        const emotion = ctx.get(emotionCtx);
        emotion.flush();
        await theme(ctx as unknown as Pre)(ctx);
        this.#flushListener.forEach((f) => f());
    }
}

export const themeManagerCtx = createSlice(new ThemeManager(), 'themeManager');

export const createThemeManager = () => new ThemeManager();
