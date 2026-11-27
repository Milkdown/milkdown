import type {
  Fragment,
  Mark,
  MarkType,
  Node,
  NodeType,
  Schema,
} from '@milkdown/prose/model'

import { serializerMatchError } from '@milkdown/exception'

import type {
  JSONRecord,
  MarkSchema,
  MarkdownNode,
  NodeSchema,
  RemarkParser,
  Root,
} from '../utility'
import type { Serializer } from './types'

import { Stack } from '../utility'
import { SerializerStackElement } from './stack-element'

const isFragment = (x: Node | Fragment): x is Fragment =>
  Object.prototype.hasOwnProperty.call(x, 'size')

interface OpenMark {
  mark: Mark
  /// Whether the mark node can span multiple prosemirror nodes.
  /// Value based marks (e.g. inlineCode) hold their content as a single
  /// value and must be closed after the node that carries them.
  spanning: boolean
  /// Whether the runner of the mark wrote a node on its own, by returning
  /// `true`. Such a mark is complete even when it has no children.
  selfContained?: boolean
}

/// A mark node with no value and nothing but empty text in it.
const isEmptyMark = (element: SerializerStackElement) =>
  !element.value &&
  !element.children?.some((child) => child.type !== 'text' || child.value)

/// State for serializer.
/// Transform prosemirror state into remark AST.
export class SerializerState extends Stack<
  MarkdownNode,
  SerializerStackElement
> {
  /// @internal
  #openMarks: OpenMark[] = []
  /// Get the schema of state.
  readonly schema: Schema

  /// Create a serializer from schema and remark instance.
  ///
  /// ```typescript
  /// const serializer = SerializerState.create(schema, remark)
  /// const markdown = parser(prosemirrorDoc)
  /// ```
  static create = (schema: Schema, remark: RemarkParser): Serializer => {
    const state = new this(schema)
    return (content: Node) => {
      state.run(content)
      return state.toString(remark)
    }
  }

  /// @internal
  constructor(schema: Schema) {
    super()
    this.schema = schema
  }

  /// @internal
  #matchTarget = (node: Node | Mark): NodeType | MarkType => {
    const result = Object.values({
      ...this.schema.nodes,
      ...this.schema.marks,
    }).find((x): x is NodeType | MarkType => {
      const spec = x.spec as NodeSchema | MarkSchema
      return spec.toMarkdown.match(node as Node & Mark)
    })

    if (!result) throw serializerMatchError(node.type)

    return result
  }

  /// @internal
  #runProseNode = (node: Node) => {
    const type = this.#matchTarget(node)
    const spec = type.spec as NodeSchema
    return spec.toMarkdown.runner(this, node)
  }

  /// @internal
  #runProseMark = (mark: Mark, node: Node) => {
    const type = this.#matchTarget(mark)
    const spec = type.spec as MarkSchema
    return spec.toMarkdown.runner(this, mark, node)
  }

  /// @internal
  /// Count the nodes in a row, starting with the one at `index`, that carry
  /// `mark`.
  #spanOf = (mark: Mark, siblings: Fragment | undefined, index: number) => {
    let span = 1
    while (siblings?.maybeChild(index + span)?.marks.some((x) => x.eq(mark)))
      span++
    return span
  }

  /// @internal
  /// Order the marks of a node so that marks which are already open keep
  /// their current nesting order and can stay open, followed by the newly
  /// opened marks sorted by priority. Among newly opened marks of the same
  /// priority, the one that runs over more of the following siblings goes
  /// outside, so a shorter mark ending inside it does not force it to close
  /// and reopen (`[*foo* bar](url)` must not become two links).
  #orderMarks = (
    marks: readonly Mark[],
    siblings?: Fragment,
    index = 0
  ): Mark[] => {
    const getPriority = (x: Mark) => x.type.spec.priority ?? 50
    const spans = new Map<Mark, number>()
    const getSpan = (x: Mark) => {
      let span = spans.get(x)
      if (span == null) {
        span = this.#spanOf(x, siblings, index)
        spans.set(x, span)
      }
      return span
    }
    const rest = [...marks].sort(
      (a, b) => getPriority(a) - getPriority(b) || getSpan(b) - getSpan(a)
    )
    const continuing: Mark[] = []
    this.#openMarks.forEach(({ mark }) => {
      const index = rest.findIndex((x) => x.eq(mark))
      if (index >= 0) continuing.push(...rest.splice(index, 1))
    })
    return continuing.concat(rest)
  }

  /// @internal
  /// Close open marks that do not continue into the next node.
  /// A mark can only stay open if every mark outside of it also stays open,
  /// so scan from the outermost mark and close everything starting at the
  /// first mark that ends here.
  #closeEndedMarks = (next?: Node) => {
    const nextMarks = next?.marks
    let keep = 0
    while (keep < this.#openMarks.length) {
      const { mark, spanning } = this.#openMarks[keep] as OpenMark
      if (spanning && nextMarks?.some((x) => x.eq(mark))) keep++
      else break
    }
    for (let i = this.#openMarks.length - 1; i >= keep; i--)
      this.#closeMark((this.#openMarks[i] as OpenMark).mark)
  }

  /// @internal
  #runNode = (node: Node, siblings?: Fragment, index = 0) => {
    const marks = this.#orderMarks(node.marks, siblings, index)
    const owner = marks.find((mark) => this.#runProseMark(mark, node))
    if (owner) {
      const open = this.#openMarks.find((x) => x.mark.eq(owner))
      if (open) open.selfContained = true
    } else {
      this.#runProseNode(node)
    }

    this.#closeEndedMarks(siblings?.maybeChild(index + 1) ?? undefined)
  }

  /// @internal
  #maybeMergeChildren = (node: MarkdownNode): MarkdownNode => {
    const { children } = node
    if (!children) return node

    node.children = children.reduce((nextChildren, child, index) => {
      if (index === 0) return [child]

      const last = nextChildren.at(-1)
      if (last && last.isMark && child.isMark) {
        const { children: currChildren, ...currRest } = child
        const { children: prevChildren, ...prevRest } = last
        if (
          child.type === last.type &&
          currChildren &&
          prevChildren &&
          JSON.stringify(currRest) === JSON.stringify(prevRest)
        ) {
          const next = {
            ...prevRest,
            children: [...prevChildren, ...currChildren],
          }
          return nextChildren
            .slice(0, -1)
            .concat(this.#maybeMergeChildren(next))
        }
      }
      return nextChildren.concat(child)
    }, [] as MarkdownNode[])

    return node
  }

  /// @internal
  #createMarkdownNode = (element: SerializerStackElement) => {
    const node: MarkdownNode = {
      ...element.props,
      type: element.type,
    }

    if (element.children) node.children = element.children

    if (element.value) node.value = element.value

    return node
  }

  /// Open a new node, the next operations will
  /// add nodes into that new node until `closeNode` is called.
  openNode = (type: string, value?: string, props?: JSONRecord) => {
    this.open(SerializerStackElement.create(type, undefined, value, props))
    return this
  }

  #moveSpaces = (element: SerializerStackElement, onPush: () => void) => {
    let startSpaces = ''
    let endSpaces = ''
    const children = element.children

    if (children) {
      const firstChild = children[0] as
        | (MarkdownNode & { value: string })
        | undefined
      const lastChild = children.at(-1) as
        | (MarkdownNode & { value: string })
        | undefined
      if (
        lastChild &&
        lastChild.type === 'text' &&
        lastChild.value.endsWith(' ')
      ) {
        const text = lastChild.value
        const trimmed = text.trimEnd()
        endSpaces = text.slice(trimmed.length)
        lastChild.value = trimmed
      }
      if (
        firstChild &&
        firstChild.type === 'text' &&
        firstChild.value.startsWith(' ')
      ) {
        const text = firstChild.value
        const trimmed = text.trimStart()
        startSpaces = text.slice(0, text.length - trimmed.length)
        firstChild.value = trimmed
      }
    }

    if (startSpaces.length) this.#addNodeAndPush('text', undefined, startSpaces)

    onPush()

    if (endSpaces.length) this.#addNodeAndPush('text', undefined, endSpaces)
  }

  /// @internal
  #closeNodeAndPush = (): MarkdownNode => {
    const element = this.close()

    return this.#addNodeAndPush(
      element.type,
      element.children,
      element.value,
      element.props
    )
  }

  /// Close the current node and push it into the parent node.
  closeNode = () => {
    this.#closeNodeAndPush()
    return this
  }

  /// @internal
  #addNodeAndPush = (
    type: string,
    children?: MarkdownNode[],
    value?: string,
    props?: JSONRecord
  ): MarkdownNode => {
    const element = SerializerStackElement.create(type, children, value, props)
    const node: MarkdownNode = this.#maybeMergeChildren(
      this.#createMarkdownNode(element)
    )
    this.push(node)
    return node
  }

  /// Add a node into current node.
  addNode = (
    type: string,
    children?: MarkdownNode[],
    value?: string,
    props?: JSONRecord
  ) => {
    this.#addNodeAndPush(type, children, value, props)
    return this
  }

  /// @internal
  #openMark = (
    mark: Mark,
    type: string,
    value?: string,
    props?: JSONRecord
  ) => {
    const isIn = this.#openMarks.some((x) => x.mark.eq(mark))

    if (isIn) return this

    this.#openMarks.push({ mark, spanning: value == null })
    return this.openNode(type, value, { ...props, isMark: true })
  }

  /// @internal
  #closeMark = (mark: Mark): void => {
    let index = -1
    for (let i = this.#openMarks.length - 1; i >= 0; i--) {
      if ((this.#openMarks[i] as OpenMark).mark.eq(mark)) {
        index = i
        break
      }
    }

    if (index < 0) return

    const [open] = this.#openMarks.splice(index, 1) as [OpenMark]
    const element = this.close()

    this.#moveSpaces(element, () => {
      // Markdown has no form for a mark with nothing in it: `****` reads
      // back as a thematic break or as plain asterisks. Do not write a
      // mark whose nodes wrote nothing, or nothing but spaces.
      if (!open.selfContained && isEmptyMark(element)) return

      this.#addNodeAndPush(
        element.type,
        element.children,
        element.value,
        element.props
      )
    })
  }

  /// Open a new mark, the next nodes added will have that mark.
  /// The mark will be kept open across nodes that share it and
  /// closed automatically when it no longer applies.
  withMark = (mark: Mark, type: string, value?: string, props?: JSONRecord) => {
    this.#openMark(mark, type, value, props)
    return this
  }

  /// Close a opened mark.
  /// In most cases you don't need this because
  /// marks will be closed automatically.
  closeMark = (mark: Mark) => {
    this.#closeMark(mark)
    return this
  }

  /// @internal
  build = (): MarkdownNode => {
    let doc: MarkdownNode | null = null
    do doc = this.#closeNodeAndPush()
    while (this.size())

    // An mdast root must always carry a children array, even when nothing
    // was serialized (e.g. a document of only empty paragraphs).
    if (!doc.children) doc.children = []

    return doc
  }

  /// Give the node or node list back to the state and the state will find a
  /// proper runner (by `match` method in serializer spec) to handle it. When a
  /// node list is given, marks shared between adjacent nodes are kept open
  /// across them so that they are serialized as one continuous span.
  next = (nodes: Node | Fragment) => {
    if (isFragment(nodes)) {
      nodes.forEach((node, _offset, index) => {
        this.#runNode(node, nodes, index)
      })
      return this
    }
    this.#runNode(nodes)
    return this
  }

  /// Use a remark parser to serialize current AST stored.
  override toString = (remark: RemarkParser): string =>
    remark.stringify(this.build() as Root)

  /// Transform a prosemirror node tree into remark AST.
  run = (tree: Node) => {
    this.#openMarks = []
    this.next(tree)

    return this
  }
}
