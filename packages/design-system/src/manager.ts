/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin, Pre, Slice } from '@milkdown/ctx'
import { createContainer, createSlice } from '@milkdown/ctx'

import { emotionCtx } from './emotion'

export type ThemeSlice<Ret = unknown, T = undefined> = (payload: T) => Ret | undefined
export type ThemeSliceKey<Ret = unknown, T = undefined, K extends string = string> = Slice<ThemeSlice<Ret, T>, K>

export const createThemeSliceKey = <Ret, T = undefined, K extends string = string>(key: K): ThemeSliceKey<Ret, T, K> =>
  createSlice((() => null as unknown as Ret) as ThemeSlice<Ret, T>, key)

type GetRet<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<infer Ret, any, any> ? Ret : unknown

type GetPayload<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, infer T, any> ? T : undefined

type GetKey<Key extends ThemeSliceKey> = Key extends ThemeSliceKey<any, any, infer T> ? T : undefined

export class ThemeManager {
  #container = createContainer()
  #cache: Map<string, ThemeSlice> = new Map()
  #flushListener: Set<() => void> = new Set()
  #executor: () => void = () => {
    /* noop */
  }

  inject<Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T>): void {
    key(this.#container.sliceMap)
  }

  has(key: ThemeSliceKey | string): boolean {
    const name = typeof key === 'string' ? key : key.sliceName
    if (this.#cache.has(name))
      return true

    const meta = this.#container.getSlice(key)

    return meta.get()(null as never) != null
  }

  set<

        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(key: Key | (K & string), themeSlice: ThemeSlice<Ret, Payload>): void
  set<Ret = unknown, T = undefined>(key: ThemeSliceKey<Ret, T> | string, themeSlice: ThemeSlice<Ret, T>): void
  set(key: ThemeSliceKey | string, themeSlice: ThemeSlice): void {
    const name = typeof key === 'string' ? key : key.sliceName
    this.#cache.set(name, themeSlice as ThemeSlice)
  }

  get<

        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(key: Key | (K & string), payload: Payload): Ret {
    const name = typeof key === 'string' ? key : (key as Key).sliceName
    const lazyGet = this.#cache.get(name)
    if (lazyGet) {
      const meta = this.#container.getSlice(key)
      meta.set(lazyGet)
      this.#cache.delete(key as string)
    }
    const meta = this.#container.getSlice(key)

    return meta.get()(payload) as Ret
  }

  getSlice<

        Key extends ThemeSliceKey<any, any, any>,
        Ret extends GetRet<Key> = GetRet<Key>,
        Payload extends GetPayload<Key> = GetPayload<Key>,
        K extends GetKey<Key> = GetKey<Key>,
    >(key: Key | (K & string)): ThemeSlice<Ret, Payload> {
    const name: string = typeof key === 'string' ? key : (key as Key).sliceName
    const lazyGet = this.#cache.get(name)
    if (lazyGet) {
      const meta = this.#container.getSlice(key)
      meta.set(lazyGet)
      this.#cache.delete(key as string)
    }
    const meta = this.#container.getSlice(key)

    return meta.get()
  }

  onFlush(fn: () => void, callWhenRegister = true): void {
    if (!this.#flushListener.has(fn))
      this.#flushListener.add(fn)

    if (callWhenRegister)
      fn()
  }

  async switch(ctx: Ctx, theme: MilkdownPlugin) {
    const emotion = ctx.get(emotionCtx)
    emotion.flush()
    await theme(ctx as unknown as Pre)(ctx)
    this.runExecutor()
    this.#flushListener.forEach(f => f())
  }

  flush(ctx: Ctx) {
    const emotion = ctx.get(emotionCtx)
    emotion.flush()
    this.runExecutor()
    this.#flushListener.forEach(f => f())
  }

  setExecutor(executor: () => void): void {
    executor()
    this.#executor = executor
  }

  runExecutor(): void {
    this.#executor()
  }
}

export const themeManagerCtx = createSlice(new ThemeManager(), 'themeManager')

export const createThemeManager = () => new ThemeManager()
