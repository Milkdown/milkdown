/* Copyright 2021, Milkdown by Mirone. */

/// @internal
export type Many<T> = T | ReadonlyArray<T>

interface Pipe {
  pipe: (<A extends any[], R1, R2, R3, R4, R5, R6, R7>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7,
  ) => (...args: A) => R7) & (<A extends any[], R1, R2, R3, R4, R5, R6, R7>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
    f7: (a: R6) => R7,
    ...func: Array<Many<(a: any) => any>>
  ) => (...args: A) => any) & (<A extends any[], R1, R2, R3, R4, R5, R6>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
  ) => (...args: A) => R6) & (<A extends any[], R1, R2, R3, R4, R5>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
  ) => (...args: A) => R5) & (<A extends any[], R1, R2, R3, R4>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
  ) => (...args: A) => R4) & (<A extends any[], R1, R2, R3>(f1: (...args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3) => (...args: A) => R3) & (<A extends any[], R1, R2>(f1: (...args: A) => R1, f2: (a: R1) => R2) => (...args: A) => R2) & ((...func: Array<Many<(...args: any[]) => any>>) => (...args: any[]) => any)
}

/// @internal
export const pipe: Pipe['pipe'] = (...funcs: any[]) => {
  const length = funcs.length
  let index = length
  while (index--) {
    if (typeof funcs[index] !== 'function')
      throw new TypeError('Expected a function')
  }
  return (...args: any[]) => {
    let index = 0
    let result = length ? funcs[index](...args) : args[0]
    while (++index < length)
      result = funcs[index](result)

    return result
  }
}
