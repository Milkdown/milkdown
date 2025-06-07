export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends Record<string, any>
      ? DeepPartial<T[K]>
      : T[K] extends Record<string, any> | null | undefined
        ? DeepPartial<T[K]> | null | undefined
        : T[K]
}
