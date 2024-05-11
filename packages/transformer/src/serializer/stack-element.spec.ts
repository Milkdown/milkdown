import { expect, it } from 'vitest'
import { SerializerStackElement } from './stack-element'

it('serializer-stack-element', () => {
  const element = SerializerStackElement.create('type')

  expect(element.props).toEqual({})

  element.push({ type: 'text' })

  expect(element.children).toEqual([{ type: 'text' }])

  const node = element.pop()

  expect(node).toEqual({ type: 'text' })
})
