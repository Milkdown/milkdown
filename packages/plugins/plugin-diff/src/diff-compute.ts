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
      // and mark attribute changes (e.g. link href) are detected.
      const markTokens = marks
        .map((m) => {
          const attrs = m.attrs
          const keys = attrs
            ? Object.keys(attrs)
                .filter((k) => attrs[k] != null)
                .sort()
            : []
          if (keys.length === 0) return m.type.name
          const encoded: Record<string, unknown> = {}
          for (const k of keys) encoded[k] = attrs[k]
          return `${m.type.name}:${JSON.stringify(encoded)}`
        })
        .sort()
        .join(',')
      return `${char}:${markTokens}`
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

/// A range that restricts the diff to a sub-region of both documents.
/// Omitted fields default to 0 (start) or content.size (end).
export interface ComputeDiffRange {
  fromA?: number
  toA?: number
  fromB?: number
  toB?: number
}

/// Options for `computeDocDiff`.
export interface ComputeDocDiffOptions {
  /// Restrict the diff to a sub-region of both documents.
  range?: ComputeDiffRange
  /// Map of node type names to attribute keys to ignore when diffing.
  ignoreAttrs?: DiffIgnoreAttrs
}

/// Compute fine-grained changes between two ProseMirror documents.
/// When `options.range` is provided, only the specified region is diffed.
export function computeDocDiff(
  oldDoc: Node,
  newDoc: Node,
  options?: ComputeDocDiffOptions
): readonly Change[] {
  const oldSize = oldDoc.content.size
  const newSize = newDoc.content.size
  const fromA = Math.max(0, Math.min(options?.range?.fromA ?? 0, oldSize))
  const toA = Math.max(fromA, Math.min(options?.range?.toA ?? oldSize, oldSize))
  const fromB = Math.max(0, Math.min(options?.range?.fromB ?? 0, newSize))
  const toB = Math.max(fromB, Math.min(options?.range?.toB ?? newSize, newSize))

  const step = new ReplaceStep(
    fromA,
    toA,
    new Slice(newDoc.content.cut(fromB, toB), 0, 0)
  )

  const encoder = createDiffEncoder(options?.ignoreAttrs)
  const changeSet = ChangeSet.create(oldDoc, undefined, encoder).addSteps(
    newDoc,
    [step.getMap()],
    null
  )

  return changeSet.changes
}
