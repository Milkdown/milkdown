import type { Node } from '@milkdown/transformer'
import { visit } from 'unist-util-visit'
import { $remark } from '@milkdown/utils'
import { withMeta } from '../__internal__/meta'

function visitImage(ast: Node) {
  return visit(ast, 'paragraph', (node: Node & { children?: Node[] }, index: number, parent: Node & { children: Node[] }) => {
    if (node.children?.length !== 1)
      return
    const firstChild = node.children?.[0]
    if (!firstChild || firstChild.type !== 'image')
      return

    const { url, alt, title } = firstChild as Node & { url: string, alt: string, title: string }
    const newNode = {
      type: 'image-block',
      url,
      alt,
      title,
    }

    parent.children.splice(index, 1, newNode)
  })
}

export const remarkImageBlockPlugin = $remark('remark-image-block', () => () => visitImage)

withMeta(remarkImageBlockPlugin.plugin, {
  displayName: 'Remark<remarkImageBlock>',
  group: 'ImageBlock',
})

withMeta(remarkImageBlockPlugin.options, {
  displayName: 'RemarkConfig<remarkImageBlock>',
  group: 'ImageBlock',
})
