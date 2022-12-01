/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Slice } from '@milkdown/core'
import { createSlice } from '@milkdown/core'

export type $Ctx<T, N extends string> = MilkdownPlugin & {
  key: Slice<T, N>
}

export const $ctx = <T, N extends string>(value: T, name: N): $Ctx<T, N> => {
  const slice = createSlice(value, name)
  const plugin: $Ctx<T, N> = (pre) => {
    pre.inject(slice)
    return () => {
      return (post) => {
        post.remove(slice)
      }
    }
  }

  plugin.key = slice

  return plugin
}
