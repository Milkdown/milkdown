export const createTiming = (name: string) => {
    const event = new Event(name);

    const timing = () =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(`Timing ${name} timeout.`);
            }, 5000);
            addEventListener(name, () => {
                resolve(undefined);
            });
        });

    timing.done = () => {
        dispatchEvent(event);
    };

    return timing;
};
