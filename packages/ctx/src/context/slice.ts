/* Copyright 2021, Milkdown by Mirone. */
import { ctxCallOutOfScope } from '@milkdown/exception'
import type { SliceMap } from './container'

export class Slice<T = any, N extends string = string> {
  readonly type: SliceType<T, N>
  #value: T

  constructor(container: SliceMap, value: T, type: SliceType<T, N>) {
    this.type = type
    this.#value = value
    container.set(type.id, this)
  }

  set = (value: T) => {
    this.#value = value
  }

  get = () => this.#value

  update = (updater: (prev: T) => T) => {
    this.#value = updater(this.#value)
  }
}

export class SliceType<T = any, N extends string = string> {
  readonly id: symbol
  readonly name: N
  readonly _typeInfo: () => T
  readonly _defaultValue: T

  constructor(value: T, name: N) {
    this.id = Symbol(`Context-${name}`)
    this.name = name
    this._defaultValue = value
    this._typeInfo = (): T => {
      throw ctxCallOutOfScope()
    }
  }

  create(container: SliceMap, value: T = this._defaultValue): Slice<T, N> {
    return new Slice(container, value, this)
  }
}

export const createSlice = <T = any, N extends string = string>(value: T, name: N) => new SliceType(value, name)
