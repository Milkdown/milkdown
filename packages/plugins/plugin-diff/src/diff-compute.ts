import type { Change } from '@milkdown/prose/changeset'
import type { Mark, Node } from '@milkdown/prose/model'

import { ChangeSet } from '@milkdown/prose/changeset'
import { Slice } from '@milkdown/prose/model'
import { ReplaceStep } from '@milkdown/prose/transform'

/**
 * Custom token encoder that distinguishes nodes with non-default
 * attributes, not just their type name. This ensures that attribute
 * changes (e.g. image src, code_block language, heading level)
 * are detected by the diff.
 */
const diffEncoder = {
  encodeCharacter: (char: number, marks: readonly Mark[]) => {
    if (marks.length === 0) return char
    // Encode marks so that formatting changes (bold, italic, etc.)
    // are detected as differences, not just text content.
    const markNames = marks
      .map((m) => m.type.name)
      .sort()
      .join(',')
    return `${char}:${markNames}`
  },
  encodeNodeStart: (node: Node) => {
    const attrs = node.attrs
    if (attrs && Object.keys(attrs).length > 0) {
      const hasNonDefault = Object.keys(attrs).some((key) => {
        const defaultVal = node.type.attrs[key]?.default
        return attrs[key] !== defaultVal
      })
      if (hasNonDefault) {
        return `${node.type.name}:${JSON.stringify(attrs, Object.keys(attrs).sort())}`
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
  compareTokens: (a: unknown, b: unknown) => a === b,
}

/// Compute fine-grained changes between two ProseMirror documents.
export function computeDocDiff(oldDoc: Node, newDoc: Node): readonly Change[] {
  const step = new ReplaceStep(
    0,
    oldDoc.content.size,
    new Slice(newDoc.content.cut(0, newDoc.content.size), 0, 0)
  )

  const changeSet = ChangeSet.create(oldDoc, undefined, diffEncoder).addSteps(
    newDoc,
    [step.getMap()],
    null
  )

  return changeSet.changes
}
