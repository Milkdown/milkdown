export function buildObject<T, U>(source: T[], fn: (source: T) => [string, U], initial: Record<string, U> = {}) {
    return source.reduce((acc, cur) => {
        const [key, value] = fn(cur);
        return {
            ...acc,
            [key]: value,
        };
    }, initial);
}
