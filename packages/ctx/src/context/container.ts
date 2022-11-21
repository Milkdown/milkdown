/* Copyright 2021, Milkdown by Mirone. */
import { contextNotFound } from '@milkdown/exception'

import type { $Slice, Slice } from './slice'

export interface Container {
  readonly sliceMap: Map<symbol, $Slice>
  readonly getSlice: <T, N extends string = string>(slice: Slice<T, N> | N) => $Slice<T, N>
  readonly removeSlice: <T, N extends string = string>(slice: Slice<T, N> | N) => void
}

export const createContainer = (): Container => {
  const sliceMap: Map<symbol, $Slice> = new Map()

  const getSlice = <T, N extends string = string>(slice: Slice<T, N> | N): $Slice<T, N> => {
    const context
      = typeof slice === 'string' ? [...sliceMap.values()].find(x => x.name === slice) : sliceMap.get(slice.id)

    if (!context) {
      const name = typeof slice === 'string' ? slice : slice.sliceName
      throw contextNotFound(name)
    }
    return context as $Slice<T, N>
  }

  const removeSlice = <T, N extends string = string>(slice: Slice<T, N> | N): void => {
    const context
      = typeof slice === 'string' ? [...sliceMap.values()].find(x => x.name === slice) : sliceMap.get(slice.id)

    if (!context)
      return

    sliceMap.delete(context.id)
  }

  return { sliceMap, getSlice, removeSlice }
}
