import { expect, it } from 'vitest'
import { Stack } from './stack'

it('stack', () => {
  const stack = new Stack<number, Array<number>>()

  expect(stack.size()).toBe(0)

  stack.open([])
  stack.push(1)

  expect(stack.size()).toBe(1)
  expect(stack.top()).toEqual([1])

  stack.open([])
  stack.push(2)

  expect(stack.size()).toBe(2)
  expect(stack.top()).toEqual([2])

  stack.push(3)
  const a = stack.close()
  expect(a).toEqual([2, 3])
  expect(stack.size()).toBe(1)

  const b = stack.close()
  expect(b).toEqual([1])
  expect(stack.size()).toBe(0)
})
