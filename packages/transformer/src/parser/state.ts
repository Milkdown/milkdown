/* Copyright 2021, Milkdown by Mirone. */
import type { Attrs, MarkType, Node, NodeType, Schema } from '@milkdown/prose/model'
import { createNodeInParserFail, parserMatchError, stackOverFlow } from '@milkdown/exception'
import { Mark } from '@milkdown/prose/model'
import type { MarkSchema, MarkdownNode, NodeSchema, RemarkParser } from '../utility'
import { Stack } from '../utility'

import { ParserStackElement } from './stack-element'

/**
 * State for parser.
 * Transform remark AST into prosemirror state.
 */
export class ParserState extends Stack<Node, ParserStackElement> {
  readonly schema: Schema

  #marks: readonly Mark[] = Mark.none

  constructor(schema: Schema) {
    super()
    this.schema = schema
  }

  #hasText = (node: Node): node is Node & { text: string } => node.isText

  #maybeMerge = (a: Node, b: Node): Node | undefined => {
    if (this.#hasText(a) && this.#hasText(b) && Mark.sameSet(a.marks, b.marks))
      return this.schema.text(a.text + b.text, a.marks)

    return undefined
  }

  #matchTarget = (node: MarkdownNode): NodeType | MarkType => {
    const result = Object.values({ ...this.schema.nodes, ...this.schema.marks })
      .find((x): x is (NodeType | MarkType) => {
        const spec = x.spec as NodeSchema | MarkSchema
        return spec.parseMarkdown.match(node)
      })

    if (!result)
      throw parserMatchError(node)

    return result
  }

  #runNode = (node: MarkdownNode) => {
    const type = this.#matchTarget(node)
    const spec = type.spec as NodeSchema | MarkSchema

    spec.parseMarkdown.runner(this, node, type as NodeType & MarkType)
  }

  openNode = (nodeType: NodeType, attrs?: Attrs) => {
    this.open(ParserStackElement.create(nodeType, [], attrs))
    return this
  }

  #closeNodeAndPush = (): Node => {
    this.#marks = Mark.none
    const element = this.close()

    return this.#addNodeAndPush(element.type, element.attrs, element.content)
  }

  closeNode = () => {
    this.#closeNodeAndPush()
    return this
  }

  #addNodeAndPush = (nodeType: NodeType, attrs?: Attrs, content?: Node[]): Node => {
    const node = nodeType.createAndFill(attrs, content, this.#marks)
    if (!node)
      throw createNodeInParserFail(nodeType, attrs, content)

    this.push(node)

    return node
  }

  addNode = (nodeType: NodeType, attrs?: Attrs, content?: Node[]) => {
    this.#addNodeAndPush(nodeType, attrs, content)
    return this
  }

  openMark = (markType: MarkType, attrs?: Attrs) => {
    const mark = markType.create(attrs)

    this.#marks = mark.addToSet(this.#marks)
    return this
  }

  closeMark = (markType: MarkType) => {
    this.#marks = markType.removeFromSet(this.#marks)
  }

  addText = (text: string) => {
    const topElement = this.top()
    if (!topElement)
      throw stackOverFlow()

    const prevNode = topElement.pop()
    const currNode = this.schema.text(text, this.#marks)

    if (!prevNode) {
      topElement.push(currNode)
      return this
    }

    const merged = this.#maybeMerge(prevNode, currNode)
    if (merged) {
      topElement.push(merged)
      return this
    }
    topElement.push(prevNode, currNode)
    return this
  }

  build = (): Node => {
    let doc: Node | undefined

    do
      doc = this.#closeNodeAndPush()
    while (this.size())

    return doc
  }

  toDoc = () => this.build()

  /**
     * Transform a markdown string into prosemirror state.
     *
     * @param remark - The remark parser used.
     * @param markdown - The markdown string needs to be parsed.
     * @returns The state instance.
     */
  run = (remark: RemarkParser, markdown: string) => {
    const tree = remark.runSync(remark.parse(markdown), markdown) as MarkdownNode
    this.next(tree)

    return this
  }

  /**
     * Give the node or node list back to the state and the state will find a proper runner (by `match` method) to handle it.
     *
     * @param nodes - The node or node list needs to be handled.
     *
     * @returns The state instance.
     */
  next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
    [nodes].flat().forEach(node => this.#runNode(node))
    return this
  }

  /**
     * Inject root node for prosemirror state.
     *
     * @param node - The target markdown node.
     * @param nodeType - The root prosemirror nodeType .
     * @param attrs - The attribute of root type.
     * @returns The state instance.
     */
  injectRoot = (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => {
    this.openNode(nodeType, attrs)
    this.next(node.children)

    return this
  }
}
