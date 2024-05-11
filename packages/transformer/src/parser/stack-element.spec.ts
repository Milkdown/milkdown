import { expect, it } from 'vitest'
import { ParserStackElement } from './stack-element'

it('parser-stack-element', () => {
  const type: any = {}
  const content = []

  const parserStackElement = ParserStackElement.create(type, content)

  expect(parserStackElement.type).toBe(type)
  expect(parserStackElement.content).toBe(content)
  expect(parserStackElement.attrs).toBeUndefined()

  const node1: any = {}
  const node2: any = {}

  parserStackElement.push(node1, node2)
  expect(content).toEqual([node1, node2])

  expect(parserStackElement.pop()).toBe(node2)
  expect(content).toEqual([node1])
})
