/* Copyright 2021, Milkdown by Mirone. */
import type { Mark } from '@milkdown/prose/model'
import type { Root } from 'mdast'

import type { MarkdownNode } from '..'
import type { JSONRecord } from '../utility'
import { getStackUtil } from '../utility'
import type { StackElement } from './stack-element'
import { createElement } from './stack-element'

interface Ctx {
  marks: readonly Mark[]
  readonly elements: StackElement[]
}

const { size, push, open, close } = getStackUtil<MarkdownNode, StackElement, Ctx>()

const searchType = (child: MarkdownNode, type: string): MarkdownNode => {
  if (child.type === type)
    return child

  if (child.children?.length !== 1)
    return child

  const searchNode = (node: MarkdownNode): MarkdownNode | null => {
    if (node.type === type)
      return node

    if (node.children?.length !== 1)
      return null

    const [firstChild] = node.children
    if (!firstChild)
      return null

    return searchNode(firstChild)
  }

  const target = searchNode(child)

  if (!target)
    return child

  const tmp = target.children ? [...target.children] : undefined
  const node = { ...child, children: tmp }
  node.children = tmp
  target.children = [node]

  return target
}

const maybeMergeChildren = (element: MarkdownNode) => {
  const { children } = element
  if (!children)
    return element

  element.children = children.reduce((nextChildren, child, index) => {
    if (index === 0)
      return [child]

    const last = nextChildren[nextChildren.length - 1]
    if (last && last.isMark && child.isMark) {
      child = searchType(child, last.type)
      const { children: currChildren, ...currRest } = child
      const { children: prevChildren, ...prevRest } = last
      if (
        child.type === last.type
                && currChildren
                && prevChildren
                && JSON.stringify(currRest) === JSON.stringify(prevRest)
      ) {
        const next = {
          ...prevRest,
          children: [...prevChildren, ...currChildren],
        }
        return nextChildren.slice(0, -1).concat(maybeMergeChildren(next))
      }
    }
    return nextChildren.concat(child)
  }, [] as MarkdownNode[])

  return element
}

const createMarkdownNode = (element: StackElement) => {
  const node: MarkdownNode = {
    ...element.props,
    type: element.type,
  }

  if (element.children)
    node.children = element.children

  if (element.value)
    node.value = element.value

  return node
}

const openNode
    = (ctx: Ctx) =>
      (type: string, value?: string, props?: JSONRecord): void =>
        open(ctx)(createElement(type, [], value, props))

const addNode
    = (ctx: Ctx) =>
      (type: string, children?: MarkdownNode[], value?: string, props?: JSONRecord): MarkdownNode => {
        const element = createElement(type, children, value, props)
        const node: MarkdownNode = maybeMergeChildren(createMarkdownNode(element))

        push(ctx)(node)

        return node
      }

const closeNode = (ctx: Ctx) => (): MarkdownNode => {
  const element = close(ctx)

  return addNode(ctx)(element.type, element.children, element.value, element.props)
}

const openMark
    = (ctx: Ctx) =>
      (mark: Mark, type: string, value?: string, props?: JSONRecord): void => {
        const isIn = mark.isInSet(ctx.marks)

        if (isIn)
          return

        ctx.marks = mark.addToSet(ctx.marks)
        openNode(ctx)(type, value, { ...props, isMark: true })
      }

const closeMark
    = (ctx: Ctx) =>
      (mark: Mark): MarkdownNode | null => {
        if (!mark.isInSet(ctx.marks))
          return null
        ctx.marks = mark.type.removeFromSet(ctx.marks)
        return closeNode(ctx)()
      }

const build = (ctx: Ctx) => () => {
  let doc: Root | null = null
  do
    doc = closeNode(ctx)() as Root
  while (size(ctx))

  return doc
}

export interface Stack {
  /**
     * Build the remark AST tree with current stack.
     *
     * @returns A remark AST tree.
     */
  build: () => Root

  /**
     * Open a mark.
     *
     * @param mark - The mark need to be opened.
     * @param type - Type of this mark.
     * @param value - Value of this mark.
     * @param props - Additional props of this mark.
     *
     * @returns
     */
  openMark: (mark: Mark, type: string, value?: string, props?: JSONRecord) => void

  /**
     * Close current mark.
     * @param mark - The prosemirror mark of target mark to be closed.
     *
     * @returns The mark closed, will be null if not exists.
     */
  closeMark: (mark: Mark) => MarkdownNode | null

  /**
     * Open a node.
     *
     * @param type - Type of this node.
     * @param value - Value of this node.
     * @param props - Additional props of this node.
     *
     * @returns
     */
  openNode: (type: string, value?: string, props?: JSONRecord) => void

  /**
     * Add a node in current position.
     *
     * @param type - Type of this node.
     * @param children - Children of this node.
     * @param value - Value of this node.
     * @param props - Additional props of this node.
     *
     * @returns The added node.
     */
  addNode: (type: string, children?: MarkdownNode[], value?: string, props?: JSONRecord) => MarkdownNode

  /**
     * Close current node.
     *
     * @returns The node closed.
     */
  closeNode: () => MarkdownNode
}

export const createStack = (): Stack => {
  const ctx: Ctx = {
    marks: [],
    elements: [],
  }

  return {
    build: build(ctx),
    openMark: openMark(ctx),
    closeMark: closeMark(ctx),
    openNode: openNode(ctx),
    addNode: addNode(ctx),
    closeNode: closeNode(ctx),
  }
}
