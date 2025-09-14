import type { Node } from '@milkdown/prose/model'
import type { RootContent, Text } from 'hast'
import type { Refractor } from 'refractor/core'

import { findChildren } from '@milkdown/prose'
import { Decoration, DecorationSet } from '@milkdown/prose/view'

interface FlattedNode {
  text: string
  className: string[]
}

function flatNodes(nodes: RootContent[], className: string[] = []) {
  return nodes.flatMap((node): FlattedNode[] =>
    node.type === 'element'
      ? flatNodes(node.children, [
          ...className,
          ...((node.properties?.className as string[]) || []),
        ])
      : [{ text: (node as Text).value, className }]
  )
}

export function getDecorations(doc: Node, name: string, refractor: Refractor) {
  const { highlight, listLanguages } = refractor
  const allLanguages = listLanguages()
  const decorations: Decoration[] = []

  findChildren((node) => node.type.name === name)(doc).forEach((block) => {
    let from = block.pos + 1
    const { language } = block.node.attrs
    if (!language || !allLanguages.includes(language)) {
      console.warn(
        'Unsupported language detected, this language has not been supported by current prism config: ',
        language
      )
      return
    }
    const nodes = highlight(block.node.textContent, language)

    flatNodes(nodes.children).forEach((node) => {
      const to = from + node.text.length

      if (node.className.length) {
        const decoration = Decoration.inline(from, to, {
          class: node.className.join(' '),
        })

        decorations.push(decoration)
      }

      from = to
    })
  })

  return DecorationSet.create(doc, decorations)
}
