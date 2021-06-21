type Prepend<T, U extends unknown[]> = [T, ...U];
type Keys_<T extends Record<string, unknown>, U extends PropertyKey[]> = {
    [P in keyof T]: Record<string, unknown> extends Omit<T, P> ? [P] : Prepend<P, Keys_<Omit<T, P>, U>>;
}[keyof T];
export type Keys<T extends Record<string, unknown>> = Keys_<T, []>;
