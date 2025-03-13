import { findChildren } from '@milkdown/prose'
import type { Node } from '@milkdown/prose/model'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import type { Refractor } from 'refractor/core'
import type { RootContent, Text } from 'hast'

export interface FlattedNode {
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
      // eslint-disable-next-line no-console
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
