export const buildObject = <T, U>(source: T[], fn: (source: T) => [string, U], initial: Record<string, U> = {}) =>
    source.map(fn).reduce(
        (acc, [key, value]) => ({
            ...acc,
            [key]: value,
        }),
        initial,
    );
