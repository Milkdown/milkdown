import type { Change, TokenEncoder } from '@milkdown/prose/changeset'
import type { Mark, Node } from '@milkdown/prose/model'

import { ChangeSet, Change as ChangeCtor } from '@milkdown/prose/changeset'
import { Fragment, Slice } from '@milkdown/prose/model'
import { ReplaceStep } from '@milkdown/prose/transform'

/// A map of node type names to arrays of attribute keys that should be
/// ignored when computing diffs. For example, `{ heading: ['id'] }` will
/// skip the `id` attribute on heading nodes.
export type DiffIgnoreAttrs = Record<string, string[]>

/// A symmetric range that restricts the diff to a sub-region of both documents.
/// The same `from`/`to` positions are used in both old and new docs.
/// Omitted fields default to 0 (start) or content.size (end).
export interface ComputeDiffRange {
  from?: number
  to?: number
}

/// Options for `computeDocDiff`.
export interface ComputeDocDiffOptions {
  /// Restrict the diff to a sub-region of both documents.
  range?: ComputeDiffRange
  /// Map of node type names to attribute keys to ignore when diffing.
  ignoreAttrs?: DiffIgnoreAttrs
}

/// Maximum children count per container for which we run LCS matching.
/// Beyond this threshold we fall back to the legacy single-step path to
/// avoid O(n*m) cost.
const LCS_MAX_CHILDREN = 500

/**
 * Create a token encoder that encodes ALL non-default attrs for every node,
 * but skips attrs listed in the `ignoreAttrs` map for a given node type.
 */
function createDiffEncoder(
  ignoreAttrs: DiffIgnoreAttrs = {}
): TokenEncoder<string | number> {
  // Cache individual mark tokens and combined mark-set tokens.
  // ProseMirror marks are ordered by type rank and structurally shared,
  // so the same readonly Mark[] reference is reused for identical mark sets.
  const singleMarkCache = new WeakMap<Mark, string>()
  const markSetCache = new WeakMap<readonly Mark[], string>()

  function encodeMark(m: Mark): string {
    let token = singleMarkCache.get(m)
    if (token != null) return token

    const attrs = m.attrs
    const keys = attrs
      ? Object.keys(attrs)
          .filter((k) => attrs[k] != null)
          .sort()
      : []
    if (keys.length === 0) {
      token = m.type.name
    } else {
      const encoded: Record<string, unknown> = {}
      for (const k of keys) encoded[k] = attrs[k]
      token = `${m.type.name}:${JSON.stringify(encoded)}`
    }
    singleMarkCache.set(m, token)
    return token
  }

  return {
    encodeCharacter: (char: number, marks: readonly Mark[]) => {
      if (marks.length === 0) return char
      let combined = markSetCache.get(marks)
      if (combined == null) {
        combined = marks.map(encodeMark).join(',')
        markSetCache.set(marks, combined)
      }
      return `${char}:${combined}`
    },
    encodeNodeStart: (node: Node) => {
      const attrs = node.attrs
      if (attrs && Object.keys(attrs).length > 0) {
        const ignored = ignoreAttrs[node.type.name] ?? []
        const relevantKeys = Object.keys(attrs).filter((key) => {
          if (ignored.includes(key)) return false
          const defaultVal = (node.type.spec.attrs as any)?.[key]?.default
          return attrs[key] !== defaultVal
        })
        if (relevantKeys.length > 0) {
          const encoded: Record<string, unknown> = {}
          for (const key of relevantKeys.sort()) {
            encoded[key] = attrs[key]
          }
          return `${node.type.name}:${JSON.stringify(encoded)}`
        }
      }
      return node.type.name
    },
    encodeNodeEnd: (node: Node) => {
      const schema = node.type.schema
      const cache: Record<string, number> =
        schema.cached.changeSetIDs ||
        (schema.cached.changeSetIDs = Object.create(null))
      let id = cache[node.type.name]
      if (id == null)
        cache[node.type.name] = id =
          Object.keys(schema.nodes).indexOf(node.type.name) + 1
      return -id
    },
    compareTokens: (a, b) => a === b,
  }
}

/// Compute a structural signature for a node by walking it with the
/// token encoder. Two nodes with the same signature are considered
/// equal for LCS matching (respects ignoreAttrs via the encoder).
function nodeSignature(
  node: Node,
  encoder: TokenEncoder<string | number>,
  cache: WeakMap<Node, string>
): string {
  const cached = cache.get(node)
  if (cached != null) return cached

  const parts: string[] = [String(encoder.encodeNodeStart(node))]
  if (node.isText) {
    const text = node.text!
    for (let i = 0; i < text.length; i++) {
      parts.push(
        ':' + String(encoder.encodeCharacter(text.charCodeAt(i), node.marks))
      )
    }
  } else {
    node.content.forEach((child) => {
      parts.push('/' + nodeSignature(child, encoder, cache))
    })
  }
  parts.push('\\' + String(encoder.encodeNodeEnd(node)))

  const sig = parts.join('')
  cache.set(node, sig)
  return sig
}

interface TopChild {
  node: Node
  offset: number // offset inside parent content (before the child)
  size: number // node.nodeSize
  signature: string
}

/// A parent container paired with its absolute content-start position in
/// the full doc. `content` is the list of LCS-ready children, computed once.
interface ParentPair {
  node: Node
  contentStart: number
  content: TopChild[]
}

/// Shared state carried through the per-block recursion.
interface LcsEnv {
  encoder: TokenEncoder<string | number>
  sigCache: WeakMap<Node, string>
}

function makeParentPair(
  node: Node,
  contentStart: number,
  env: LcsEnv
): ParentPair {
  const content: TopChild[] = []
  let offset = 0
  node.content.forEach((child) => {
    content.push({
      node: child,
      offset,
      size: child.nodeSize,
      signature: nodeSignature(child, env.encoder, env.sigCache),
    })
    offset += child.nodeSize
  })
  return { node, contentStart, content }
}

/// LCS DP over two arrays of TopChildren matched by signature.
/// Returns list of matched index pairs [oldIdx, newIdx] in order.
function lcsMatch(
  oldList: TopChild[],
  newList: TopChild[]
): Array<[number, number]> {
  const n = oldList.length
  const m = newList.length
  // DP table
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: m + 1 }, () => 0)
  )
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (oldList[i]!.signature === newList[j]!.signature) {
        dp[i]![j] = dp[i + 1]![j + 1]! + 1
      } else {
        dp[i]![j] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
      }
    }
  }
  // Backtrack
  const matches: Array<[number, number]> = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (oldList[i]!.signature === newList[j]!.signature) {
      matches.push([i, j])
      i++
      j++
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      i++
    } else {
      j++
    }
  }
  return matches
}

/// Decide whether a matched pair can be recursed into.
/// Container nodes (non-textblock, non-code, non-atom) with matching type
/// are recursed; textblocks and atoms go through the per-pair ChangeSet.
function canRecurse(oldNode: Node, newNode: Node): boolean {
  if (oldNode.type !== newNode.type) return false
  const type = oldNode.type
  if (type.isTextblock) return false
  if (type.isAtom) return false
  if (type.spec.code === true) return false
  if (!type.isBlock) return false
  return true
}

/// Create a Change with translated positions from a sub-ChangeSet change.
function translateChange(change: Change, absA: number, absB: number): Change {
  return ChangeCtor.fromJSON({
    fromA: change.fromA + absA,
    toA: change.toA + absA,
    fromB: change.fromB + absB,
    toB: change.toB + absB,
    deleted: change.deleted.map((s) => ({ length: s.length, data: s.data })),
    inserted: change.inserted.map((s) => ({ length: s.length, data: s.data })),
  })
}

/// A node to diff, paired with its parent (used as a wrapper) and its
/// absolute position in the full doc.
interface PairSide {
  node: Node
  parent: Node
  abs: number
}

/// Diff a single pair of nodes using a per-pair ChangeSet.
/// Wraps both nodes in a copy of their parent so positions stay valid.
function diffPairWithChangeSet(
  oldSide: PairSide,
  newSide: PairSide,
  env: LcsEnv
): Change[] {
  const wrapperOld = oldSide.parent.copy(Fragment.from(oldSide.node))
  const wrapperNew = newSide.parent.copy(Fragment.from(newSide.node))
  const step = new ReplaceStep(
    0,
    wrapperOld.content.size,
    new Slice(wrapperNew.content, 0, 0)
  )
  const cs = ChangeSet.create(wrapperOld, undefined, env.encoder).addSteps(
    wrapperNew,
    [step.getMap()],
    null
  )
  return cs.changes.map((c) => translateChange(c, oldSide.abs, newSide.abs))
}

/// Absolute position where an unmatched child should anchor its
/// counterpart in the other doc. When the cursor still points at a child,
/// use that child's offset. Otherwise fall back to the right edge of the
/// previous child, or the parent content size if the list is empty.
function anchorOffset(pair: ParentPair, cursor: number): number {
  const list = pair.content
  if (cursor < list.length) return pair.contentStart + list[cursor]!.offset
  if (cursor > 0) {
    const prev = list[cursor - 1]!
    return pair.contentStart + prev.offset + prev.size
  }
  return pair.contentStart + pair.node.content.size
}

function pureDelete(child: TopChild, absA: number, anchorB: number): Change {
  return ChangeCtor.fromJSON({
    fromA: absA,
    toA: absA + child.size,
    fromB: anchorB,
    toB: anchorB,
    deleted: [{ length: child.size, data: null }],
    inserted: [],
  })
}

function pureInsert(child: TopChild, anchorA: number, absB: number): Change {
  return ChangeCtor.fromJSON({
    fromA: anchorA,
    toA: anchorA,
    fromB: absB,
    toB: absB + child.size,
    deleted: [],
    inserted: [{ length: child.size, data: null }],
  })
}

/// Large-container fallback: diff the container's content directly with
/// a single ChangeSet, without wrapping. Positions returned by the
/// changeset are relative to the container's content and get translated
/// to absolute doc positions via the caller-supplied `contentStart`.
function diffContainerContent(
  oldNode: Node,
  newNode: Node,
  oldContentStart: number,
  newContentStart: number,
  env: LcsEnv
): Change[] {
  const step = new ReplaceStep(
    0,
    oldNode.content.size,
    new Slice(newNode.content, 0, 0)
  )
  const cs = ChangeSet.create(oldNode, undefined, env.encoder).addSteps(
    newNode,
    [step.getMap()],
    null
  )
  return cs.changes.map((c) =>
    translateChange(c, oldContentStart, newContentStart)
  )
}

/// Diff two container nodes by matching their children with LCS.
/// Returns changes with absolute positions (relative to the full doc).
///
/// The large-container guard runs against raw `childCount` so we never
/// eagerly compute signatures for a subtree that's about to be handled
/// by the single-step fallback.
function diffChildrenLcs(
  oldNode: Node,
  newNode: Node,
  oldContentStart: number,
  newContentStart: number,
  env: LcsEnv
): Change[] {
  if (
    oldNode.childCount > LCS_MAX_CHILDREN ||
    newNode.childCount > LCS_MAX_CHILDREN
  ) {
    return diffContainerContent(
      oldNode,
      newNode,
      oldContentStart,
      newContentStart,
      env
    )
  }

  const oldPair = makeParentPair(oldNode, oldContentStart, env)
  const newPair = makeParentPair(newNode, newContentStart, env)
  const matches = lcsMatch(oldPair.content, newPair.content)
  const result: Change[] = []
  let i = 0
  let j = 0
  for (const [mi, mj] of matches) {
    processGap(
      oldPair,
      newPair,
      { oldStart: i, oldEnd: mi, newStart: j, newEnd: mj },
      env,
      result
    )
    i = mi + 1
    j = mj + 1
  }
  processGap(
    oldPair,
    newPair,
    {
      oldStart: i,
      oldEnd: oldPair.content.length,
      newStart: j,
      newEnd: newPair.content.length,
    },
    env,
    result
  )
  return result
}

interface GapWindow {
  oldStart: number
  oldEnd: number
  newStart: number
  newEnd: number
}

/// Process a gap of unmatched children: greedily align same-typed nodes
/// into pairs, emit pure insert/delete for leftovers.
function processGap(
  oldPair: ParentPair,
  newPair: ParentPair,
  window: GapWindow,
  env: LcsEnv,
  out: Change[]
): void {
  const oldList = oldPair.content
  const newList = newPair.content
  let oi = window.oldStart
  let ni = window.newStart

  while (oi < window.oldEnd || ni < window.newEnd) {
    const oldChild = oi < window.oldEnd ? oldList[oi]! : null
    const newChild = ni < window.newEnd ? newList[ni]! : null
    const sameType =
      oldChild && newChild && oldChild.node.type === newChild.node.type

    if (oldChild && newChild && sameType) {
      out.push(...diffSameTypePair(oldPair, newPair, oldChild, newChild, env))
      oi++
      ni++
      continue
    }

    if (oldChild && (!newChild || !sameType)) {
      const absA = oldPair.contentStart + oldChild.offset
      out.push(pureDelete(oldChild, absA, anchorOffset(newPair, ni)))
      oi++
      continue
    }

    if (newChild) {
      const absB = newPair.contentStart + newChild.offset
      out.push(pureInsert(newChild, anchorOffset(oldPair, oi), absB))
      ni++
    }
  }
}

/// Diff a pair of same-typed children: recurse into containers when
/// possible, otherwise fall back to a per-pair ChangeSet.
function diffSameTypePair(
  oldPair: ParentPair,
  newPair: ParentPair,
  oldChild: TopChild,
  newChild: TopChild,
  env: LcsEnv
): Change[] {
  const absA = oldPair.contentStart + oldChild.offset
  const absB = newPair.contentStart + newChild.offset

  // Textblocks, atoms, code, and nodes whose own attrs differ all go
  // through the per-pair ChangeSet. Recursion would miss attribute-level
  // differences on the container node itself.
  const shouldRecurse =
    canRecurse(oldChild.node, newChild.node) &&
    attrsEqual(oldChild.node, newChild.node, env.encoder)

  if (!shouldRecurse) {
    return diffPairWithChangeSet(
      { node: oldChild.node, parent: oldPair.node, abs: absA },
      { node: newChild.node, parent: newPair.node, abs: absB },
      env
    )
  }

  return diffChildrenLcs(oldChild.node, newChild.node, absA + 1, absB + 1, env)
}

/// Quick check for attr differences between two same-type nodes, using
/// the encoder's node-start token (which respects ignoreAttrs).
function attrsEqual(
  a: Node,
  b: Node,
  encoder: TokenEncoder<string | number>
): boolean {
  return encoder.encodeNodeStart(a) === encoder.encodeNodeStart(b)
}

/// A boundary-aligned subtree pair extracted from a sub-region range.
///
/// `cutAbsStart` is the absolute doc position where the cut subtree's
/// first child sits in the original doc. It equals the range's `from`,
/// and is the same in both docs because the precondition loop verifies
/// the path from the doc root to the shared ancestor has the same
/// absolute starts on both sides. It's the value to pass as
/// `contentStart` to `diffChildrenLcs`.
interface RangeSubtree {
  oldCut: Node
  newCut: Node
  cutAbsStart: number
}

/// Reduce a `[from, to)` sub-region into a pair of cut subtrees that the
/// per-block LCS path can diff directly. Throws `RangeError` when any
/// precondition fails:
///
/// - the docs disagree on `sharedDepth` for the range
/// - any ancestor along the shared chain differs in type, attrs (via
///   `encoder.encodeNodeStart`, so `ignoreAttrs` is honoured), or
///   absolute starting position
/// - the shared ancestor is a textblock (per-block can't subdivide
///   inside a textblock — callers should widen the range to a block
///   boundary instead)
/// - either endpoint lands mid-child instead of between siblings of the
///   shared ancestor — `Fragment.cut` would mutate the boundary child's
///   `nodeSize` and break absolute-position translation
function buildRangeSubtree(
  oldDoc: Node,
  newDoc: Node,
  from: number,
  to: number,
  encoder: TokenEncoder<string | number>
): RangeSubtree {
  const $oldFrom = oldDoc.resolve(from)
  const $oldTo = oldDoc.resolve(to)
  const $newFrom = newDoc.resolve(from)
  const $newTo = newDoc.resolve(to)

  const sharedDepth = $oldFrom.sharedDepth(to)
  if ($newFrom.sharedDepth(to) !== sharedDepth) {
    throw new RangeError(
      `computeDocDiff: range [${from}, ${to}) resolves to different sharedDepth in old and new docs`
    )
  }

  // Ancestor chain identity: the encoder's node-start token always
  // begins with `node.type.name`, so a single equality check rejects
  // type mismatches AND attr differences (and honours ignoreAttrs).
  // Also require the same absolute start position at every depth up to
  // sharedDepth — this guarantees the cut node's first child lines up
  // at `from` in both docs.
  for (let d = 0; d <= sharedDepth; d++) {
    if (
      encoder.encodeNodeStart($oldFrom.node(d)) !==
      encoder.encodeNodeStart($newFrom.node(d))
    ) {
      throw new RangeError(
        `computeDocDiff: ancestor at depth ${d} differs in type or non-ignored attrs along the path to the shared ancestor`
      )
    }
    if ($oldFrom.start(d) !== $newFrom.start(d)) {
      throw new RangeError(
        `computeDocDiff: ancestor at depth ${d} starts at different absolute positions in old and new docs (content before the range differs in size)`
      )
    }
  }

  const sharedOld = $oldFrom.node(sharedDepth)
  if (sharedOld.isTextblock) {
    throw new RangeError(
      `computeDocDiff: range [${from}, ${to}) lands inside a textblock; widen the range to a block boundary`
    )
  }

  // Boundary alignment: both endpoints sit between children of the shared
  // ancestor. ResolvedPos.depth equals sharedDepth precisely when the
  // position is at a sibling boundary (not inside a child).
  if (
    $oldFrom.depth !== sharedDepth ||
    $oldTo.depth !== sharedDepth ||
    $newFrom.depth !== sharedDepth ||
    $newTo.depth !== sharedDepth
  ) {
    throw new RangeError(
      `computeDocDiff: range [${from}, ${to}) endpoints must be aligned to top-level child boundaries of the shared ancestor`
    )
  }

  const sharedNew = $newFrom.node(sharedDepth)
  const ancestorContentStart = $oldFrom.start(sharedDepth)
  const localFrom = from - ancestorContentStart
  const localTo = to - ancestorContentStart

  // Boundary-aligned cut: Fragment.cut leaves child nodes untouched and
  // only adjusts which children are included.
  const oldCut = sharedOld.copy(sharedOld.content.cut(localFrom, localTo))
  const newCut = sharedNew.copy(sharedNew.content.cut(localFrom, localTo))

  // The cut node's first child has offset 0 inside the cut but absolute
  // position `from` in the original doc, so `from` is the contentStart
  // we hand back to diffChildrenLcs.
  return { oldCut, newCut, cutAbsStart: from }
}

/// Compute fine-grained changes between two ProseMirror documents.
///
/// Uses per-block LCS matching (recursing into container nodes like
/// bullet_list, blockquote, table). Without `options.range`, the entire
/// document is diffed.
///
/// When `options.range` is provided, the diff is restricted to that
/// region. The range must satisfy these preconditions or the call
/// throws `RangeError`:
///
/// - **boundary-aligned**: both endpoints sit between siblings of a
///   common (non-textblock) container ancestor — i.e. not inside a
///   textblock and not in the middle of a child node
/// - **structurally identical path**: the chain of ancestors leading to
///   that shared container has the same node types, attrs (modulo
///   `ignoreAttrs`), and absolute start positions in both docs
///
/// Out-of-bounds endpoints are clamped silently. An empty range returns
/// no changes.
export function computeDocDiff(
  oldDoc: Node,
  newDoc: Node,
  options?: ComputeDocDiffOptions
): readonly Change[] {
  const encoder = createDiffEncoder(options?.ignoreAttrs)
  const env: LcsEnv = { encoder, sigCache: new WeakMap<Node, string>() }
  const oldSize = oldDoc.content.size
  const newSize = newDoc.content.size

  const range = options?.range
  if (range == null) {
    return diffChildrenLcs(oldDoc, newDoc, 0, 0, env)
  }

  // Clamp the range to a valid window. Out-of-bounds endpoints are
  // silently clamped against the smaller doc — once clamped, both old
  // and new agree on the same `[from, to)` slice.
  const minSize = Math.min(oldSize, newSize)
  const from = Math.max(0, Math.min(range.from ?? 0, minSize))
  const to = Math.max(from, Math.min(range.to ?? minSize, minSize))

  // Empty range → no changes.
  if (from === to) return []

  // Range that covers the whole common window of two same-sized docs is
  // equivalent to no range at all.
  if (from === 0 && to === minSize && oldSize === newSize) {
    return diffChildrenLcs(oldDoc, newDoc, 0, 0, env)
  }

  const subtree = buildRangeSubtree(oldDoc, newDoc, from, to, encoder)
  return diffChildrenLcs(
    subtree.oldCut,
    subtree.newCut,
    subtree.cutAbsStart,
    subtree.cutAbsStart,
    env
  )
}
