import type { Change } from '@milkdown/prose/changeset'
import type { Mark, Node } from '@milkdown/prose/model'

import { ChangeSet } from '@milkdown/prose/changeset'
import { Slice } from '@milkdown/prose/model'
import { ReplaceStep } from '@milkdown/prose/transform'

/// A map of node type names to arrays of attribute keys that should be
/// ignored when computing diffs. For example, `{ heading: ['id'] }` will
/// skip the `id` attribute on heading nodes.
export type DiffIgnoreAttrs = Record<string, string[]>

/**
 * Create a token encoder that encodes ALL non-default attrs for every node,
 * but skips attrs listed in the `ignoreAttrs` map for a given node type.
 */
function createDiffEncoder(ignoreAttrs: DiffIgnoreAttrs = {}) {
  return {
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
    compareTokens: (a: unknown, b: unknown) => a === b,
  }
}

/// Compute fine-grained changes between two ProseMirror documents.
export function computeDocDiff(
  oldDoc: Node,
  newDoc: Node,
  ignoreAttrs?: DiffIgnoreAttrs
): readonly Change[] {
  const step = new ReplaceStep(
    0,
    oldDoc.content.size,
    new Slice(newDoc.content.cut(0, newDoc.content.size), 0, 0)
  )

  const encoder = createDiffEncoder(ignoreAttrs)
  const changeSet = ChangeSet.create(oldDoc, undefined, encoder).addSteps(
    newDoc,
    [step.getMap()],
    null
  )

  return changeSet.changes
}
