import type {
  Attrs,
  MarkType,
  Node,
  NodeType,
  Schema,
} from '@milkdown/prose/model'
import {
  createNodeInParserFail,
  parserMatchError,
  stackOverFlow,
} from '@milkdown/exception'
import { Mark } from '@milkdown/prose/model'
import type {
  MarkSchema,
  MarkdownNode,
  NodeSchema,
  RemarkParser,
} from '../utility'
import { Stack } from '../utility'

import { ParserStackElement } from './stack-element'
import type { Parser } from './types'

/// A state machine for parser. Transform remark AST into prosemirror state.
export class ParserState extends Stack<Node, ParserStackElement> {
  /// The schema in current editor.
  readonly schema: Schema

  /// @internal
  #marks: readonly Mark[] = Mark.none

  /// Create a parser from schema and remark instance.
  ///
  /// ```typescript
  /// const parser = ParserState.create(schema, remark)
  /// const prosemirrorNode = parser(SomeMarkdownText)
  /// ```
  static create = (schema: Schema, remark: RemarkParser): Parser => {
    const state = new this(schema)
    return (text) => {
      state.run(remark, text)
      return state.toDoc()
    }
  }

  /// @internal
  protected constructor(schema: Schema) {
    super()
    this.schema = schema
  }

  /// @internal
  #hasText = (node: Node): node is Node & { text: string } => node.isText

  /// @internal
  #maybeMerge = (a: Node, b: Node): Node | undefined => {
    if (this.#hasText(a) && this.#hasText(b) && Mark.sameSet(a.marks, b.marks))
      return this.schema.text(a.text + b.text, a.marks)

    return undefined
  }

  /// @internal
  #matchTarget = (node: MarkdownNode): NodeType | MarkType => {
    const result = Object.values({
      ...this.schema.nodes,
      ...this.schema.marks,
    }).find((x): x is NodeType | MarkType => {
      const spec = x.spec as NodeSchema | MarkSchema
      return spec.parseMarkdown.match(node)
    })

    if (!result) throw parserMatchError(node)

    return result
  }

  /// @internal
  #runNode = (node: MarkdownNode) => {
    const type = this.#matchTarget(node)
    const spec = type.spec as NodeSchema | MarkSchema

    spec.parseMarkdown.runner(this, node, type as NodeType & MarkType)
  }

  /// Inject root node for prosemirror state.
  injectRoot = (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => {
    this.openNode(nodeType, attrs)
    this.next(node.children)

    return this
  }

  /// Open a new node, the next operations will
  /// add nodes into that new node until `closeNode` is called.
  openNode = (nodeType: NodeType, attrs?: Attrs) => {
    this.open(ParserStackElement.create(nodeType, [], attrs))
    return this
  }

  /// @internal
  #closeNodeAndPush = (): Node => {
    this.#marks = Mark.none
    const element = this.close()

    return this.#addNodeAndPush(element.type, element.attrs, element.content)
  }

  /// Close the current node and push it into the parent node.
  closeNode = () => {
    this.#closeNodeAndPush()
    return this
  }

  /// @internal
  #addNodeAndPush = (
    nodeType: NodeType,
    attrs?: Attrs,
    content?: Node[]
  ): Node => {
    const node = nodeType.createAndFill(attrs, content, this.#marks)
    if (!node) throw createNodeInParserFail(nodeType, attrs, content)

    this.push(node)

    return node
  }

  /// Add a node into current node.
  addNode = (nodeType: NodeType, attrs?: Attrs, content?: Node[]) => {
    this.#addNodeAndPush(nodeType, attrs, content)
    return this
  }

  /// Open a new mark, the next nodes added will have that mark.
  openMark = (markType: MarkType, attrs?: Attrs) => {
    const mark = markType.create(attrs)

    this.#marks = mark.addToSet(this.#marks)
    return this
  }

  /// Close a opened mark.
  closeMark = (markType: MarkType) => {
    this.#marks = markType.removeFromSet(this.#marks)
    return this
  }

  /// Add a text node into current node.
  addText = (text: string) => {
    const topElement = this.top()
    if (!topElement) throw stackOverFlow()

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

  /// @internal
  build = (): Node => {
    let doc: Node | undefined

    do doc = this.#closeNodeAndPush()
    while (this.size())

    return doc
  }

  /// Give the node or node list back to the state and
  /// the state will find a proper runner (by `match` method in parser spec) to handle it.
  next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
    ;[nodes].flat().forEach((node) => this.#runNode(node))
    return this
  }

  /// Build the current state into a [prosemirror document](https://prosemirror.net/docs/ref/#model.Document_Structure).
  toDoc = () => this.build()

  /// Transform a markdown string into prosemirror state.
  run = (remark: RemarkParser, markdown: string) => {
    const tree = remark.runSync(
      remark.parse(markdown),
      markdown
    ) as MarkdownNode
    this.next(tree)

    return this
  }
}
