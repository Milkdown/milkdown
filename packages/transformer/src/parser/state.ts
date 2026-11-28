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
import type { ParseResult, Parser } from './types'

import { layoutOf } from '../source/layout'
import { Stack } from '../utility'
import { ParserStackElement } from './stack-element'

const BOM = 0xfeff

/// What the last `run` of a parser state read.
interface Parsed {
  /// The markdown text without a byte order mark.
  text: string
  /// 1 when the markdown text starts with a byte order mark.
  shift: number
  tree: MarkdownNode
  /// How many top-level nodes each top-level node of `tree` made.
  counts: number[] | null
}

/// A state machine for parser. Transform remark AST into prosemirror state.
export class ParserState extends Stack<Node, ParserStackElement> {
  /// The schema in current editor.
  readonly schema: Schema

  /// @internal
  #marks: readonly Mark[] = Mark.none

  /// @internal
  #parsed: Parsed | null = null

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
  constructor(schema: Schema) {
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

    const root = this.top()
    const counts: number[] = []
    node.children?.forEach((child) => {
      const before = root?.content.length ?? 0
      this.next(child)
      counts.push((root?.content.length ?? 0) - before)
    })
    if (this.#parsed?.tree === node) this.#parsed.counts = counts

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
    try {
      this.#closeNodeAndPush()
    } catch (e) {
      console.error(e)
    }
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
    try {
      this.#addNodeAndPush(nodeType, attrs, content)
    } catch (e) {
      console.error(e)
    }
    return this
  }

  /// Check whether a mark of this type is active.
  hasMark = (markType: MarkType): boolean => !!markType.isInSet(this.#marks)

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
    try {
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
    } catch (e) {
      console.error(e)
      return this
    }
  }

  /// @internal
  build = (): Node => {
    let doc: Node | undefined

    do doc = this.#closeNodeAndPush()
    while (this.size())

    return doc
  }

  /// Give the node or node list back to the state and the state will find a
  /// proper runner (by `match` method in parser spec) to handle it.
  next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
    ;[nodes].flat().forEach((node) => this.#runNode(node))
    return this
  }

  /// Build the current state into a
  /// [prosemirror document](https://prosemirror.net/docs/ref/#model.Document_Structure).
  toDoc = () => this.build()

  /// Build the current state into a document, and say where each top-level
  /// node of the document is in the markdown text of the last `run`.
  ///
  /// ```typescript
  /// const state = new ParserState(schema)
  /// const { doc, ast, blocks } = state.run(remark, markdown).toResult()
  /// const { from, to } = blocks[0]
  /// markdown.slice(from, to) // the text of doc.child(0)
  /// ```
  toResult = (): ParseResult => {
    const parsed = this.#parsed
    this.#parsed = null
    const doc = this.toDoc()
    if (!parsed) return { doc, ast: null, blocks: null, detached: [] }

    const { text, shift, tree, counts } = parsed
    const layout = layoutOf(text, tree, shift)
    // The ranges belong to the nodes of the document only when each
    // markdown node made exactly one of them. An empty tree is fine: the
    // document then has nothing but the node that fills it.
    const oneToOne =
      counts != null &&
      counts.length === layout.blocks?.length &&
      counts.every((count) => count === 1) &&
      (counts.length === 0 || doc.childCount === counts.length)

    return {
      doc,
      ast: tree,
      blocks: oneToOne ? layout.blocks : null,
      detached: layout.detached,
    }
  }

  /// Transform a markdown string into prosemirror state.
  run = (remark: RemarkParser, markdown: string) => {
    // Code without types can pass something that is not a string. Remark
    // reads it as a file, and there is no text to tell positions in.
    if (typeof markdown !== 'string') {
      this.#parsed = null
      this.next(
        remark.runSync(remark.parse(markdown), markdown) as MarkdownNode
      )
      return this
    }

    // The offsets that remark gives do not count a byte order mark, so
    // parse the text without it. Plugins that read the text by offset get
    // the same text.
    const shift = markdown.charCodeAt(0) === BOM ? 1 : 0
    const text = shift ? markdown.slice(1) : markdown
    const tree = remark.runSync(remark.parse(text), text) as MarkdownNode
    this.#parsed = { text, shift, tree, counts: null }
    this.next(tree)

    return this
  }
}
