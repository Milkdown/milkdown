/* Copyright 2021, Milkdown by Mirone. */
import type { Container, Slice } from '../context';
import type { Clock, Timer } from '../timing';

export class Pre {
    #container: Container;
    #clock: Clock;

    constructor(container: Container, clock: Clock) {
        this.#container = container;
        this.#clock = clock;
    }

    /**
     * Inject a context into current editor.
     *
     * @param ctx - The context needs to be injected.
     * @param defaultValue - The default value of this context.
     * @returns Pre.
     */
    readonly inject = <T>(ctx: Slice<T>, defaultValue?: T) => {
        ctx(this.#container.sliceMap, defaultValue);
        return this;
    };

    /**
     * Start to record for a timer.
     *
     * @param timer - The timer needs to be recorded.
     * @returns Pre.
     */
    readonly record = (timer: Timer) => {
        timer(this.#clock.store);
        return this;
    };
}
