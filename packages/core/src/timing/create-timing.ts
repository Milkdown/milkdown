export const createTiming = (name: string, timeout = 3000) => {
    const event = new Event(name);

    const timing = () =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(`Timing ${name} timeout.`);
            }, timeout);
            addEventListener(name, () => {
                resolve(undefined);
            });
        });

    timing.done = () => {
        dispatchEvent(event);
    };

    return timing;
};
