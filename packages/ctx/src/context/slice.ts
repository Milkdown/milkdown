import { ctxCallOutOfScope } from '@milkdown/exception'
import type { SliceMap } from './container'

/// Slice is a value of slice type.
export class Slice<T = any, N extends string = string> {
  /// The type of the slice.
  readonly type: SliceType<T, N>

  /// @internal
  #watchers: Array<(value: T) => unknown> = []

  /// @internal
  #value: T

  /// @internal
  #emit = () => {
    this.#watchers.forEach((watcher) => watcher(this.#value))
  }

  /// @internal
  constructor(container: SliceMap, value: T, type: SliceType<T, N>) {
    this.type = type
    this.#value = value
    container.set(type.id, this)
  }

  /// Add a watcher for changes in the slice.
  /// Returns a function to remove the watcher.
  on(watcher: (value: T) => unknown) {
    this.#watchers.push(watcher)
    return () => {
      this.#watchers = this.#watchers.filter((w) => w !== watcher)
    }
  }

  /// Add a one-time watcher for changes in the slice.
  /// The watcher will be removed after it is called.
  /// Returns a function to remove the watcher.
  once(watcher: (value: T) => unknown) {
    const off = this.on((value) => {
      watcher(value)
      off()
    })
    return off
  }

  /// Remove a watcher.
  off(watcher: (value: T) => unknown) {
    this.#watchers = this.#watchers.filter((w) => w !== watcher)
  }

  /// Remove all watchers.
  offAll() {
    this.#watchers = []
  }

  /// Set the value of the slice.
  set = (value: T) => {
    this.#value = value
    this.#emit()
  }

  /// Get the value of the slice.
  get = () => this.#value

  /// Update the value of the slice with a callback.
  update = (updater: (prev: T) => T) => {
    this.#value = updater(this.#value)
    this.#emit()
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
export const createSlice = <T = any, N extends string = string>(
  value: T,
  name: N
) => new SliceType(value, name)
