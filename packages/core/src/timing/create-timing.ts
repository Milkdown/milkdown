export const createTiming = () => {
    const name = Date.now().toString();
    const event = new Event(name);

    const timing = () =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject();
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
