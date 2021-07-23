export type Timing = {
    (): Promise<void>;
    done: () => void;
};

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
        if (!meta) throw new Error();
        return meta;
    };

    return {
        store,
        get,
    };
};

export const createTimer = (name: string, timeout = 3000): Timer => {
    const id = Symbol('Timer');

    const timer = (store: ClockMap) => {
        const data = Symbol(name);

        const timing: Timing = () =>
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(`Timing ${name} timeout.`);
                }, timeout);
                addEventListener(name, (e) => {
                    if (!(e instanceof CustomEvent)) {
                        return;
                    }
                    if (e.detail.id === data) {
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
