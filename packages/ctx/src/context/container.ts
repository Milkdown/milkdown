/* Copyright 2021, Milkdown by Mirone. */
import { contextNotFound } from '@milkdown/exception'

import type { Slice, SliceType } from './slice'

export type SliceMap = Map<symbol, Slice>

export class Container {
  sliceMap: SliceMap = new Map()

  get = <T, N extends string = string>(slice: SliceType<T, N> | N): Slice<T, N> => {
    const context = typeof slice === 'string'
      ? [...this.sliceMap.values()].find(x => x.type.name === slice)
      : this.sliceMap.get(slice.id)

    if (!context) {
      const name = typeof slice === 'string' ? slice : slice.name
      throw contextNotFound(name)
    }
    return context as Slice<T, N>
  }

  has = <T, N extends string = string>(slice: SliceType<T, N> | N): boolean => {
    if (typeof slice === 'string')
      return [...this.sliceMap.values()].some(x => x.type.name === slice)

    return this.sliceMap.has(slice.id)
  }

  remove = <T, N extends string = string>(slice: SliceType<T, N> | N): void => {
    const context = typeof slice === 'string'
      ? [...this.sliceMap.values()].find(x => x.type.name === slice)
      : this.sliceMap.get(slice.id)

    if (!context)
      return

    this.sliceMap.delete(context.type.id)
  }
}
