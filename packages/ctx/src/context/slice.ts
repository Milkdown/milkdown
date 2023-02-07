/* Copyright 2021, Milkdown by Mirone. */
import { ctxCallOutOfScope } from '@milkdown/exception'
import type { SliceMap } from './container'

/// Slice is a value of slice type.
export class Slice<T = any, N extends string = string> {
  /// The type of the slice.
  readonly type: SliceType<T, N>

  /// @internal
  #value: T

  /// @internal
  constructor(container: SliceMap, value: T, type: SliceType<T, N>) {
    this.type = type
    this.#value = value
    container.set(type.id, this)
  }

  /// Set the value of the slice.
  set = (value: T) => {
    this.#value = value
  }

  /// Get the value of the slice.
  get = () => this.#value

  /// Update the value of the slice with a callback.
  update = (updater: (prev: T) => T) => {
    this.#value = updater(this.#value)
  }
}

/// Slice type can be used to create slices in different containers.
export class SliceType<T = any, N extends string = string> {
  /// The unique id of the slice type.
  readonly id: symbol
  /// The name of the slice type.
  readonly name: N
  /// @internal
  readonly _typeInfo: () => T
  /// @internal
  readonly _defaultValue: T

  /// Create a slice type with a default value and a name.
  /// The name should be unique in the container.
  constructor(value: T, name: N) {
    this.id = Symbol(`Context-${name}`)
    this.name = name
    this._defaultValue = value
    this._typeInfo = (): T => {
      throw ctxCallOutOfScope()
    }
  }

  /// Create a slice with a container.
  /// You can also pass a value to override the default value.
  create(container: SliceMap, value: T = this._defaultValue): Slice<T, N> {
    return new Slice(container, value, this)
  }
}

/// Create a slice type with a default value and a name.
/// This is equivalent to `new SliceType(value, name)`.
export const createSlice = <T = any, N extends string = string>(value: T, name: N) => new SliceType(value, name)
