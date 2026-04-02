import type { Change } from '@milkdown/prose/changeset'
import type { Mark, Node } from '@milkdown/prose/model'

import { ChangeSet } from '@milkdown/prose/changeset'
import { Slice } from '@milkdown/prose/model'
import { ReplaceStep } from '@milkdown/prose/transform'

/**
 * Custom token encoder that distinguishes nodes by their content-semantic
 * attributes. Atom nodes (image, math_inline) encode all attrs. Code nodes
 * (code_block) encode language. Marks encode formatting. Other nodes only
 * encode their type name to avoid false positives from runtime-generated
 * attrs (e.g. heading id from headingIdGenerator).
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
    // Encode attributes for nodes where attrs affect content semantics:
    // - Atom/leaf nodes (image, math_inline): all attrs matter (src, value, etc.)
    // - Code nodes (code_block): language attr affects rendering
    // Other nodes (heading, paragraph) may have runtime-generated attrs
    // (e.g. heading id) that differ between parsed documents and would
    // cause false-positive diffs.
    const shouldEncodeAttrs =
      (node.isLeaf && node.type.spec.atom) || node.type.spec.code
    if (shouldEncodeAttrs) {
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
