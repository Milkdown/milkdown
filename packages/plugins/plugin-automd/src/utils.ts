import type { Node } from '@milkdown/prose/model'

import type { SyncNodePlaceholder } from './config'
import {
  asterisk,
  asteriskHolder,
  keepLinkRegexp,
  punctuationRegexp,
  underline,
  underlineHolder,
} from './regexp'

export function keepLink(str: string) {
  let text = str
  let match = text.match(keepLinkRegexp)
  while (match && match.groups) {
    const { span } = match.groups
    text = text.replace(keepLinkRegexp, span as string)

    match = text.match(keepLinkRegexp)
  }
  return text
}

export function mergeSlash(str: string) {
  return str
    .replaceAll(/\\\\\*/g, asterisk)
    .replaceAll(/\\\\_/g, underline)
    .replaceAll(asterisk, asteriskHolder)
    .replaceAll(underline, underlineHolder)
}

export function swap(text: string, first: number, last: number) {
  const arr = text.split('')
  const temp = arr[first]
  if (arr[first] && arr[last]) {
    arr[first] = arr[last] as string
    arr[last] = temp as string
  }
  return arr.join('').toString()
}

export function replacePunctuation(holePlaceholder: string) {
  return (text: string) => text.replace(punctuationRegexp(holePlaceholder), '')
}

export function calculatePlaceholder(placeholder: SyncNodePlaceholder) {
  return (text: string) => {
    const index = text.indexOf(placeholder.hole)
    const left = text.charAt(index - 1)
    const right = text.charAt(index + 1)
    const notAWord = /[^\w]|_/

    // cursor on the right
    if (!right) return placeholder.punctuation

    // cursor on the left
    if (!left) return placeholder.char

    if (notAWord.test(left) && notAWord.test(right))
      return placeholder.punctuation

    return placeholder.char
  }
}

export function calcOffset(node: Node, from: number, placeholder: string) {
  let offset = from
  let find = false
  node.descendants((n) => {
    if (find) return false
    if (!n.textContent.includes(placeholder)) {
      offset += n.nodeSize
      return false
    }
    if (n.isText) {
      const i = n.text?.indexOf(placeholder)
      if (i != null && i >= 0) {
        find = true
        offset += i
        return false
      }
    }

    // enter the node
    offset += 1
    return true
  })
  return offset
}
