import type { Change } from '@milkdown/prose/changeset'
import type { Node } from '@milkdown/prose/model'

import { ChangeSet } from '@milkdown/prose/changeset'
import { Slice } from '@milkdown/prose/model'
import { ReplaceStep } from '@milkdown/prose/transform'

/**
 * Custom token encoder that distinguishes leaf/atom nodes by their
 * attributes, not just their type name. This ensures that changes to
 * image-block src, math_inline value, etc. are detected by the diff.
 */
const diffEncoder = {
  encodeCharacter: (char: number) => char,
  encodeNodeStart: (node: Node) => {
    if (node.isLeaf && node.type.spec.atom) {
      // Encode atom nodes with their attributes so that attribute
      // changes are detected as differences
      return `${node.type.name}:${JSON.stringify(node.attrs, Object.keys(node.attrs).sort())}`
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
  compareTokens: (a: unknown, b: unknown) => a === b,
}

/// Compute fine-grained changes between two ProseMirror documents.
export function computeDocDiff(oldDoc: Node, newDoc: Node): readonly Change[] {
  // Create a ReplaceStep that transforms oldDoc into newDoc
  const step = new ReplaceStep(
    0,
    oldDoc.content.size,
    new Slice(newDoc.content, 0, 0)
  )

  const changeSet = ChangeSet.create(oldDoc, undefined, diffEncoder).addSteps(
    newDoc,
    [step.getMap()],
    null
  )

  return changeSet.changes
}
