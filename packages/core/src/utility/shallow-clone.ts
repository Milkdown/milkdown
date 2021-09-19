/* Copyright 2021, Milkdown by Mirone. */

export const shallowClone = <T>(x: T): T => {
    if (Array.isArray(x)) {
        return [...(x as unknown[])] as unknown as T;
    }
    if (typeof x === 'object') {
        return { ...x };
    }
    return x;
};
