import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { EditorState } from '@milkdown/prose/state'

import { parserCtx, serializerCtx } from '@milkdown/core'
import { Fragment } from '@milkdown/prose/model'
import { pipe } from '@milkdown/utils'

import { inlineSyncConfig } from './config'
import {
  asterisk,
  asteriskHolder,
  emailCandidateRegexp,
  underline,
  underlineHolder,
  trailingPunctuationRegexp,
} from './regexp'
import {
  calculatePlaceholder,
  keepLink,
  mergeSlash,
  replacePunctuation,
} from './utils'

interface InlineSyncContext {
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

    let newNode = getNewNode(ctx, text)

    if (!newNode || node.type !== newNode.type || onlyHTML(newNode)) return null

    // @ts-expect-error hijack the node attribute
    newNode.attrs = { ...node.attrs }

    let modified = false
    const children: Node[] = []

    // Pass 1: Merge adjacent Link + Text nodes
    const rawNodes: Node[] = []
    newNode.content.forEach((c) => rawNodes.push(c))

    const mergedNodes: Node[] = []
    for (const curr of rawNodes) {
      if (!curr) continue

      const prev = mergedNodes[mergedNodes.length - 1]

      const prevIsLink = prev && prev.marks.some((m) => m.type.name === 'link')
      const currIsText =
        curr.isText && !curr.marks.some((m) => m.type.name === 'link')

      if (prevIsLink && currIsText && prev.text && curr.text) {
        const combined = prev.text + curr.text
        mergedNodes[mergedNodes.length - 1] = state.schema.text(
          combined,
          prev.marks
        )
      } else {
        mergedNodes.push(curr)
      }
    }
    if (mergedNodes.length !== rawNodes.length) {
      modified = true
    }
    mergedNodes.forEach((child) => {
      const linkMark = child.marks.find((m) => m.type.name === 'link')
      if (!linkMark || !child.text) {
        children.push(child)
        return
      }

      const text = child.text
      const match = text.match(trailingPunctuationRegexp)
      const suffix = match ? match[0] : ''
      const trimmed = text.slice(0, text.length - suffix.length)

      // Strategy 1: Suffix split (existing)
      if (emailCandidateRegexp.test(trimmed)) {
        if (suffix.length > 0) modified = true
        const newMarks = child.marks.map((m) => {
          if (m.type.name === 'link') {
            return m.type.create({ ...m.attrs, href: `mailto:${trimmed}` })
          }
          return m
        })

        if (trimmed.length > 0) {
          children.push(state.schema.text(trimmed, newMarks))
        }
        if (suffix.length > 0) {
          children.push(
            state.schema.text(
              suffix,
              child.marks.filter((m) => m.type.name !== 'link')
            )
          )
        }
        return
      }

      // Strategy 2: Prefix split (fallback)
      const splitMatch = text.match(/^([a-zA-Z0-9._%+\-@]+)(.*)$/)
      if (splitMatch) {
        const possibleEmail = splitMatch[1]
        const rest = splitMatch[2]

        if (
          possibleEmail &&
          rest &&
          emailCandidateRegexp.test(possibleEmail) &&
          rest.length > 0
        ) {
          modified = true
          const newMarks = child.marks.map((m) => {
            if (m.type.name === 'link') {
              return m.type.create({
                ...m.attrs,
                href: `mailto:${possibleEmail}`,
              })
            }
            return m
          })
          children.push(state.schema.text(possibleEmail, newMarks))
          children.push(
            state.schema.text(
              rest,
              child.marks.filter((m) => m.type.name !== 'link')
            )
          )
          return
        }
      }

      // Fallback: If it's a mailto link and looks like an autolink (href contains text),
      const href = linkMark.attrs.href
      if (
        typeof href === 'string' &&
        href.startsWith('mailto:') &&
        href.includes(text)
      ) {
        modified = true
        children.push(
          state.schema.text(
            text,
            child.marks.filter((m) => m.type.name !== 'link')
          )
        )
        return
      }

      children.push(child)
    })

    if (modified) {
      newNode = newNode.copy(Fragment.from(children))
    }

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

      const href = link?.attrs.href
      const text = node.text?.replace(placeholder, '') || ''
      if (link && href?.startsWith('mailto:')) {
        const address = href.slice(7)
        const isValidCandidate = emailCandidateRegexp.test(text.trim())
        const isAddressIncomplete = !address.includes('@')
        const isTextSimple = !text.includes(' ') && text.length > 0
        const shouldSync =
          text.startsWith(address) ||
          address.startsWith(text) ||
          (isAddressIncomplete && isTextSimple)

        if (isValidCandidate && shouldSync) {
          // @ts-expect-error hijack the mark attribute
          link.attrs.href = `mailto:${text.trim()}`
        } else if (!isValidCandidate) {
          // @ts-expect-error hijack mark
          node.marks = node.marks.filter((mark) => mark.type.name !== 'link')
        }
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
