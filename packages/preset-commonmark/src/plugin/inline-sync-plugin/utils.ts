/* Copyright 2021, Milkdown by Mirone. */

import type { Node } from '@milkdown/prose/model'

import type { SyncNodePlaceholder } from './config'
import { linkRegexp, punctuationRegexp } from './regexp'

export const keepLink = (str: string) => {
  let text = str
  let match = text.match(linkRegexp)
  while (match && match.groups) {
    const { span } = match.groups
    text = text.replace(linkRegexp, span as string)

    match = text.match(linkRegexp)
  }
  return text
}

export const swap = (text: string, first: number, last: number) => {
  const arr = text.split('')
  const temp = arr[first]
  if (arr[first] && arr[last]) {
    arr[first] = arr[last] as string
    arr[last] = temp as string
  }
  return arr.join('').toString()
}

export const replacePunctuation = (holePlaceholder: string) => (text: string) =>
  text.replace(punctuationRegexp(holePlaceholder), '')

export const calculatePlaceholder = (placeholder: SyncNodePlaceholder) => (text: string) => {
  const index = text.indexOf(placeholder.hole)
  const left = text.charAt(index - 1)
  const right = text.charAt(index + 1)
  const notAWord = /[^\w]|_/

  // cursor on the right
  if (!right)
    return placeholder.punctuation

  // cursor on the left
  if (!left)
    return placeholder.char

  if (notAWord.test(left) && notAWord.test(right))
    return placeholder.punctuation

  return placeholder.char
}

export const calcOffset = (node: Node, from: number, placeholder: string) => {
  let offset = from
  let find = false
  node.descendants((n) => {
    if (find)
      return false
    if (n.isText) {
      const i = n.text?.indexOf(placeholder)
      if (i != null && i >= 0) {
        find = true
        offset += i
        return false
      }
    }
    offset += n.nodeSize
    return undefined
  })
  return offset
}
