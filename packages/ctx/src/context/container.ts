import { contextNotFound } from '@milkdown/exception'

import type { Slice, SliceType } from './slice'

/// @internal
export type SliceMap = Map<symbol, Slice>

/// Container is a map of slices.
export class Container {
  /// @internal
  sliceMap: SliceMap = new Map()

  /// Get a slice from the container by slice type or slice name.
  get = <T, N extends string = string>(
    slice: SliceType<T, N> | N
  ): Slice<T, N> => {
    const context =
      typeof slice === 'string'
        ? [...this.sliceMap.values()].find((x) => x.type.name === slice)
        : this.sliceMap.get(slice.id)

    if (!context) {
      const name = typeof slice === 'string' ? slice : slice.name
      throw contextNotFound(name)
    }
    return context as Slice<T, N>
  }

  /// Remove a slice from the container by slice type or slice name.
  remove = <T, N extends string = string>(slice: SliceType<T, N> | N): void => {
    const context =
      typeof slice === 'string'
        ? [...this.sliceMap.values()].find((x) => x.type.name === slice)
        : this.sliceMap.get(slice.id)

    if (!context) return

    this.sliceMap.delete(context.type.id)
  }

  /// Check if the container has a slice by slice type or slice name.
  has = <T, N extends string = string>(slice: SliceType<T, N> | N): boolean => {
    if (typeof slice === 'string')
      return [...this.sliceMap.values()].some((x) => x.type.name === slice)

    return this.sliceMap.has(slice.id)
  }
}
