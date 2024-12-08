import type { Ctx } from '@milkdown/ctx'
import { parserCtx, serializerCtx } from '@milkdown/core'
import type { Node } from '@milkdown/prose/model'
import type { EditorState } from '@milkdown/prose/state'
import { pipe } from '@milkdown/utils'

import { inlineSyncConfig } from './config'
import {
  calculatePlaceholder,
  keepLink,
  mergeSlash,
  replacePunctuation,
} from './utils'
import { asterisk, asteriskHolder, underline, underlineHolder } from './regexp'

export interface InlineSyncContext {
  text: string
  prevNode: Node
  nextNode: Node
  placeholder: string
}

function getNodeFromSelection(state: EditorState) {
  return state.selection.$from.node()
}

function getMarkdown(
  ctx: Ctx,
  state: EditorState,
  node: Node,
  globalNode: Node[]
) {
  const serializer = ctx.get(serializerCtx)
  const doc = state.schema.topNodeType.create(undefined, [node, ...globalNode])

  return serializer(doc)
}

function addPlaceholder(ctx: Ctx, markdown: string) {
  const config = ctx.get(inlineSyncConfig.key)
  const holePlaceholder = config.placeholderConfig.hole

  const [firstLine = '', ...rest] = markdown.split('\n\n')

  const movePlaceholder = (text: string) =>
    config.movePlaceholder(holePlaceholder, text)

  const handleText = pipe(
    replacePunctuation(holePlaceholder),
    movePlaceholder,
    keepLink,
    mergeSlash
  )

  let text = handleText(firstLine)
  const placeholder = calculatePlaceholder(config.placeholderConfig)(text)

  text = text.replace(holePlaceholder, placeholder)

  text = [text, ...rest].join('\n\n')

  return [text, placeholder] as [markdown: string, placeholder: string]
}

function getNewNode(ctx: Ctx, text: string) {
  const parser = ctx.get(parserCtx)
  const parsed = parser(text)

  if (!parsed) return null

  return parsed.firstChild
}

function collectGlobalNodes(ctx: Ctx, state: EditorState) {
  const { globalNodes } = ctx.get(inlineSyncConfig.key)
  const nodes: Node[] = []

  state.doc.descendants((node) => {
    if (
      globalNodes.includes(node.type.name) ||
      globalNodes.includes(node.type)
    ) {
      nodes.push(node)
      return false
    }

    return undefined
  })

  return nodes
}

const removeGlobalFromText = (text: string) => text.split('\n\n')[0] || ''

function onlyHTML(node: Node) {
  return node.childCount === 1 && node.child(0).type.name === 'html'
}

export function getContextByState(
  ctx: Ctx,
  state: EditorState
): InlineSyncContext | null {
  try {
    const globalNode = collectGlobalNodes(ctx, state)
    const node = getNodeFromSelection(state)

    const markdown = getMarkdown(ctx, state, node, globalNode)
    const [text, placeholder] = addPlaceholder(ctx, markdown)

    const newNode = getNewNode(ctx, text)

    if (!newNode || node.type !== newNode.type || onlyHTML(newNode)) return null

    // @ts-expect-error hijack the node attribute
    newNode.attrs = { ...node.attrs }

    newNode.descendants((node) => {
      const marks = node.marks
      const link = marks.find((mark) => mark.type.name === 'link')
      if (
        link &&
        node.text?.includes(placeholder) &&
        link.attrs.href.includes(placeholder)
      ) {
        // @ts-expect-error hijack the mark attribute
        link.attrs.href = link.attrs.href.replace(placeholder, '')
      }
      if (
        node.text?.includes(asteriskHolder) ||
        node.text?.includes(underlineHolder)
      ) {
        // @ts-expect-error hijack the attribute
        node.text = node.text
          .replaceAll(asteriskHolder, asterisk)
          .replaceAll(underlineHolder, underline)
      }
    })

    return {
      text: removeGlobalFromText(text),
      prevNode: node,
      nextNode: newNode,
      placeholder,
    }
  } catch {
    return null
  }
}
