/* Copyright 2021, Milkdown by Mirone. */
import { ClockMap, Timer } from './clock';

export type Timing = {
    (): Promise<void>;
    done: () => void;
};

export const createTimer = (name: string, timeout = 3000): Timer => {
    let isResolved = false;
    const id = Symbol('Timer');

    const timer = (store: ClockMap) => {
        const data = Symbol(name);

        const timing: Timing = () =>
            isResolved
                ? Promise.resolve(undefined)
                : new Promise((resolve, reject) => {
                      setTimeout(() => {
                          reject(`Timing ${name} timeout.`);
                      }, timeout);
                      addEventListener(name, (e) => {
                          if (!(e instanceof CustomEvent)) {
                              return;
                          }
                          if (e.detail.id === data) {
                              isResolved = true;
                              resolve(undefined);
                          }
                      });
                  });
        timing.done = () => {
            const event = new CustomEvent(name, { detail: { id: data } });
            dispatchEvent(event);
        };

        store.set(id, timing);

        return timing;
    };
    timer.id = id;

    return timer;
};
