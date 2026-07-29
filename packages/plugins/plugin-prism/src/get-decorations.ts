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

export function getBlockDecorations(
  node: Node,
  pos: number,
  refractor: Refractor,
  // `listLanguages` allocates a fresh array, so a caller highlighting several
  // blocks should build the list once and pass it in.
  languages: string[] = refractor.listLanguages()
): Decoration[] {
  const { highlight } = refractor
  const { language } = node.attrs
  if (!language || !languages.includes(language)) {
    console.warn(
      'Unsupported language detected, this language has not been supported by current prism config: ',
      language
    )
    return []
  }

  const decorations: Decoration[] = []
  let from = pos + 1

  flatNodes(highlight(node.textContent, language).children).forEach((child) => {
    const to = from + child.text.length

    if (child.className.length) {
      decorations.push(
        Decoration.inline(from, to, {
          class: child.className.join(' '),
        })
      )
    }

    from = to
  })

  return decorations
}

export function getDecorations(doc: Node, name: string, refractor: Refractor) {
  const languages = refractor.listLanguages()
  const decorations = findChildren((node) => node.type.name === name)(
    doc
  ).flatMap((block) =>
    getBlockDecorations(block.node, block.pos, refractor, languages)
  )

  return DecorationSet.create(doc, decorations)
}
