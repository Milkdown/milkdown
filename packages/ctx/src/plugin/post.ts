/* Copyright 2021, Milkdown by Mirone. */
import type { Container, Slice } from '../context'
import type { Clock, Timer } from '../timing'

export class Post {
  #container: Container
  #clock: Clock

  constructor(container: Container, clock: Clock) {
    this.#container = container
    this.#clock = clock
  }

  /**
     * Clear a timer record.
     *
     * @param timer - The timer needs to be cleared.
     * @returns Env.
     */
  readonly clearTimer = (timer: Timer) => {
    this.#clock.remove(timer)
    return this
  }

  /**
     * Remove a context from current editor.
     *
     * @param ctx - The context needs to be removed.
     * @returns Ctx.
     */
  readonly remove = <T, N extends string = string>(ctx: Slice<T, N> | N) => {
    this.#container.removeSlice(ctx)
    return this
  }
}
