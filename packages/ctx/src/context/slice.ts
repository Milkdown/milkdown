/* Copyright 2021, Milkdown by Mirone. */
import { ctxCallOutOfScope } from '@milkdown/exception'

import { shallowClone } from './shallow-clone'

export interface SliceValue<T = unknown, N extends string = string> {
  readonly id: symbol
  readonly name: N
  readonly set: (value: T) => void
  readonly get: () => T
  readonly update: (updater: (prev: T) => T) => void
}

export type SliceMap = Map<symbol, SliceValue>

export interface Slice<T, N extends string = string> {
  readonly id: symbol
  readonly sliceName: N
  readonly _typeInfo: () => T
  (container: SliceMap, resetValue?: T): SliceValue<T>
}

export const createSlice = <T, N extends string = string>(value: T, name: N): Slice<T, N> => {
  const id = Symbol(`Context-${name}`)

  const factory = (container: SliceMap, resetValue = shallowClone(value)) => {
    let inner = resetValue

    const context: SliceValue<T> = {
      name,
      id,
      set: (next) => {
        inner = next
      },
      get: () => inner,
      update: (updater) => {
        inner = updater(inner)
      },
    }
    container.set(id, context as SliceValue)
    return context
  }
  factory.sliceName = name
  factory.id = id
  factory._typeInfo = (): T => {
    throw ctxCallOutOfScope()
  }

  return factory
}
