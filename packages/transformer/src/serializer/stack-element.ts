import type { MarkdownNode } from '..'
import type { JSONRecord } from '../utility'
import { StackElement } from '../utility'

export class SerializerStackElement extends StackElement<MarkdownNode> {
  constructor(
    public type: string,
    public children?: MarkdownNode[],
    public value?: string,
    public props: JSONRecord = {}
  ) {
    super()
  }

  static create = (
    type: string,
    children?: MarkdownNode[],
    value?: string,
    props: JSONRecord = {}
  ) => new SerializerStackElement(type, children, value, props)

  push = (node: MarkdownNode, ...rest: MarkdownNode[]) => {
    if (!this.children) this.children = []

    this.children.push(node, ...rest)
  }

  pop = (): MarkdownNode | undefined => this.children?.pop()
}
