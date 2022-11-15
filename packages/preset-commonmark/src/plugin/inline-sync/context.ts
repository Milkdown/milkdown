/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { parserCtx, serializerCtx } from '@milkdown/core'
import type { Node } from '@milkdown/prose/model'
import type { EditorState } from '@milkdown/prose/state'
import { pipe } from '@milkdown/utils'

import { inlineSyncConfigCtx } from './config'
import { calculatePlaceholder, keepLink, replacePunctuation } from './utils'

export * from './config'

export interface InlineSyncContext {
  text: string
  prevNode: Node
  nextNode: Node
  placeholder: string
}

const getNodeFromSelection = (state: EditorState) => {
  const { selection } = state
  const { $from } = selection
  const node = $from.node()

  return node
}

const getMarkdown = (ctx: Ctx, state: EditorState, node: Node, globalNode: Node[]) => {
  const serializer = ctx.get(serializerCtx)
  const doc = state.schema.topNodeType.create(undefined, [node, ...globalNode])

  const markdown = serializer(doc)

  return markdown
}

const addPlaceholder = (ctx: Ctx, markdown: string) => {
  const config = ctx.get(inlineSyncConfigCtx)
  const holePlaceholder = config.placeholderConfig.hole

  const [firstLine = '', ...rest] = markdown.split('\n\n')

  const movePlaceholder = (text: string) => config.movePlaceholder(holePlaceholder, text)

  const handleText = pipe(replacePunctuation(holePlaceholder), movePlaceholder, keepLink)

  let text = handleText(firstLine)
  const placeholder = calculatePlaceholder(config.placeholderConfig)(text)

  text = text.replace(holePlaceholder, placeholder)

  text = [text, ...rest].join('\n\n')

  return [text, placeholder] as [markdown: string, placeholder: string]
}

const getNewNode = (ctx: Ctx, text: string) => {
  const parser = ctx.get(parserCtx)
  const parsed = parser(text)

  if (!parsed)
    return null

  return parsed.firstChild
}

const collectGlobalNodes = (ctx: Ctx, state: EditorState) => {
  const { globalNodes } = ctx.get(inlineSyncConfigCtx)
  const nodes: Node[] = []

  state.doc.descendants((node) => {
    if (globalNodes.includes(node.type.name) || globalNodes.includes(node.type)) {
      nodes.push(node)
      return false
    }

    return undefined
  })

  return nodes
}

const removeGlobalFromText = (text: string) => text.split('\n\n')[0] || ''

export const getContextByState = (ctx: Ctx, state: EditorState): InlineSyncContext | null => {
  try {
    const globalNode = collectGlobalNodes(ctx, state)
    const node = getNodeFromSelection(state)

    const markdown = getMarkdown(ctx, state, node, globalNode)
    const [text, placeholder] = addPlaceholder(ctx, markdown)

    const newNode = getNewNode(ctx, text)

    if (!newNode || node.type !== newNode.type)
      return null

    // @ts-expect-error hijack the node attribute
    newNode.attrs = { ...node.attrs }

    newNode.descendants((node) => {
      const marks = node.marks
      const link = marks.find(mark => mark.type.name === 'link')
      if (link && node.text?.includes(placeholder) && link.attrs.href.includes(placeholder)) {
        // @ts-expect-error hijack the mark attribute
        link.attrs.href = link.attrs.href.replace(placeholder, '')
      }
    })

    return {
      text: removeGlobalFromText(text),
      prevNode: node,
      nextNode: newNode,
      placeholder,
    }
  }
  catch {
    return null
  }
}
