/* Copyright 2021, Milkdown by Mirone. */
import { stackOverFlow } from '@milkdown/exception'

export abstract class StackElement<Node> {
  abstract push(node: Node, ...rest: Node[]): void
}

export class Stack<Node, Element extends StackElement<Node>> {
  protected elements: Element[] = []

  size = (): number => {
    return this.elements.length
  }

  top = (): Element | undefined => {
    return this.elements.at(-1)
  }

  push = (node: Node): void => {
    this.top()?.push(node)
  }

  open = (node: Element): void => {
    this.elements.push(node)
  }

  close = (): Element => {
    const el = this.elements.pop()
    if (!el)
      throw stackOverFlow()

    return el
  }
}
