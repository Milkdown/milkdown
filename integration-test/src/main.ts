/* Copyright 2021, Milkdown by Mirone. */
const commonmark = () => import('./preset-commonmark');

const mapping = {
    ['preset-commonmark']: commonmark,
};

const main = async () => {
    const url = new URL(location.href);
    if (!url.hash) {
        return;
    }

    const key: string = url.hash.slice(2);
    const name = mapping[key as keyof typeof mapping];
    if (!name) {
        throw new Error('Cannot get target test container: ' + key);
    }

    const module = await name();
    module.setup();
};

main();
