/* Copyright 2021, Milkdown by Mirone. */
import { timerNotFound } from '@milkdown/exception';

import { Timing } from './timing';

export type ClockMap = Map<symbol, Timing>;

export type Timer = {
    (store: ClockMap): Timing;
    id: symbol;
};

export type Clock = {
    store: ClockMap;
    get: (timer: Timer) => Timing;
};

export const createClock = (): Clock => {
    const store: ClockMap = new Map();
    const get = (timer: Timer) => {
        const meta = store.get(timer.id);
        if (!meta) throw timerNotFound();
        return meta;
    };

    return {
        store,
        get,
    };
};
