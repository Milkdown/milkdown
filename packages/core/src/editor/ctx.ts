/* Copyright 2021, Milkdown by Mirone. */
import type { $Slice, Container, Slice } from '../context';
import type { Clock, Timer } from '../timing';

/**
 * The ctx object that can be accessed in plugin and action.
 */
export class Ctx {
    #container: Container;
    #clock: Clock;

    constructor(container: Container, clock: Clock) {
        this.#container = container;
        this.#clock = clock;
    }

    /**
     * Get the slice instance.
     *
     * @param slice - The slice needs to be used.
     * @returns The slice instance.
     */
    readonly use = <T>(slice: Slice<T>): $Slice<T> => this.#container.getSlice(slice);

    /**
     * Get the slice value.
     *
     * @param slice - The slice needs to be used.
     * @returns The slice value.
     */
    readonly get = <T>(slice: Slice<T>) => this.use(slice).get();

    /**
     * Set the slice value.
     *
     * @param slice - The slice needs to be used.
     * @returns
     */
    readonly set = <T>(slice: Slice<T>, value: T) => this.use(slice).set(value);

    /**
     * Update the slice by it's current value.
     *
     * @example
     * ```
     * update(NumberSlice, x => x + 1);
     * ```
     *
     * @param slice - The slice needs to be used.
     * @param updater - The update function, gets current value as parameter and returns new value.
     * @returns
     */
    readonly update = <T>(slice: Slice<T>, updater: (prev: T) => T) => this.use(slice).update(updater);

    /**
     * Get the timer instance.
     *
     * @param timer - The timer needs to be used.
     * @returns The timer instance.
     */
    readonly timing = (timer: Timer) => this.#clock.get(timer);

    /**
     * Wait for a timer to finish.
     *
     * @param timer - The timer needs to be used.
     * @returns A promise that will be resolved when timer finish.
     */
    readonly wait = (timer: Timer) => this.timing(timer)();

    /**
     * Finish a timer
     *
     * @param timer - The timer needs to be finished.
     * @returns
     */
    readonly done = (timer: Timer) => this.timing(timer).done();

    /**
     * Wait for a list of timers in target slice to be all finished.
     *
     * @param slice - The slice that holds a list of timer.
     * @returns A promise that will be resolved when all timers finish.
     */
    readonly waitTimers = async (slice: Slice<Timer[]>) => {
        await Promise.all(this.get(slice).map((x) => this.wait(x)));
        return;
    };
}
