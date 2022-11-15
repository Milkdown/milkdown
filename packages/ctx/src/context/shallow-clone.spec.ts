/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest'

import { shallowClone } from './shallow-clone'

describe('context/shallow-clone', () => {
  it('shallow clone for array', () => {
    const arr: unknown[] = []
    const obj1 = {}
    const obj2 = {}
    arr.push(obj1, obj2)
    const cloned = shallowClone(arr)

    expect(cloned).toEqual(arr)
    expect(cloned[0]).toBe(obj1)
    expect(cloned[1]).toBe(obj2)
  })

  it('shallow clone for obj', () => {
    const dict: Record<string, unknown> = {}
    const obj1 = {}
    const obj2 = {}
    dict.foo = obj1
    dict.bar = obj2
    const cloned = shallowClone(dict)

    expect(cloned).toEqual(dict)
    expect(cloned.foo).toBe(obj1)
    expect(cloned.bar).toBe(obj2)
  })

  it('shallow clone for primitives', () => {
    let target: unknown
    target = 1
    expect(shallowClone(target)).toBe(target)
    target = 'str'
    expect(shallowClone(target)).toBe(target)
    target = () => null
    expect(shallowClone(target)).toBe(target)
  })
})
