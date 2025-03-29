import type { Node } from '@milkdown/transformer'
import { visit } from 'unist-util-visit'
import { $remark } from '@milkdown/utils'
import { withMeta } from '../__internal__'

function visitImage(ast: Node) {
  return visit(ast, 'paragraph', (node: Node & { children?: Node[] }) => {
    if (node.children?.length !== 1) return
    const firstChild = node.children?.[0]
    if (!firstChild || firstChild.type !== 'html') return

    const { value } = firstChild as Node & {
      value: string
    }

    if (!['<br />', '<br>', '<br/>'].includes(value)) {
      return
    }

    node.children.splice(0, 1)
  })
}

/// @internal
/// This plugin is used to preserve the empty line.
/// Markdown will fold the empty line into the previous line by default.
/// This plugin will preserve the empty line by converting `<br />` to `line-break`.
/// This plugin should be used with `linebreakSchema` to work.
export const remarkPreserveEmptyLinePlugin = $remark(
  'remark-preserve-empty-line',
  () => () => visitImage
)

withMeta(remarkPreserveEmptyLinePlugin.plugin, {
  displayName: 'Remark<remarkPreserveEmptyLine>',
  group: 'Remark',
})

withMeta(remarkPreserveEmptyLinePlugin.options, {
  displayName: 'RemarkConfig<remarkPreserveEmptyLine>',
  group: 'Remark',
})
