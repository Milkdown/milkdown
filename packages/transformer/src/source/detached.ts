import type { Node } from '../utility'
import type { DetachedSource } from './source'

/// A place in the markdown text that needs a detached piece of it.
export interface SourceUse {
  /// The offset in the markdown text of what needs the piece.
  offset: number
  /// The id of the piece that it needs.
  id: string
}

/// What a remark plugin tells the parser about the markdown text that it
/// takes out of the tree.
export interface DetachedSourceRecord {
  /// The pieces of text that will have no node.
  detached: readonly DetachedSource[]
  /// The places in the text that need one of the pieces.
  uses: readonly SourceUse[]
}

// The record travels with the tree, in the `data` that every markdown node
// has for this. Nothing is kept in this module.
const DATA_KEY = 'milkdownDetachedSource'

type TreeData = { [DATA_KEY]?: DetachedSourceRecord }

/// For a remark plugin that removes nodes from the tree, so that their
/// markdown text has no node in the document. Call it with the tree before
/// the nodes are gone.
///
/// The parser then knows that the text is not lost. With source
/// preservation, a piece of that text stays in the markdown for as long as
/// a block that needs it keeps the text it was loaded with.
///
/// The offsets are the ones in the `position` of the nodes. Only a piece
/// at the top level of the text counts. A piece inside a block is part of
/// the text of that block. The record is kept in the `data` of the tree.
///
/// ```typescript
/// const plugin = () => (tree) => {
///   recordDetachedSource(tree, {
///     detached: [{ from: 20, to: 42, id: 'note' }],
///     uses: [{ offset: 4, id: 'note' }],
///   })
///   // Now remove the node at 20 from the tree.
/// }
/// ```
export function recordDetachedSource(
  tree: Node,
  record: DetachedSourceRecord
): void {
  const data = (tree.data ??= {}) as TreeData
  const previous = data[DATA_KEY]
  data[DATA_KEY] = {
    detached: [...(previous?.detached ?? []), ...record.detached],
    uses: [...(previous?.uses ?? []), ...record.uses],
  }
}

/// @internal
export function detachedSourceOf(tree: Node): DetachedSourceRecord {
  return (
    (tree.data as TreeData | undefined)?.[DATA_KEY] ?? {
      detached: [],
      uses: [],
    }
  )
}
