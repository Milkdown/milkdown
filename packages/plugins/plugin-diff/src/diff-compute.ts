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
        // ProseMirror marks are already sorted by type rank, so no sort needed
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
    compareTokens: (a: unknown, b: unknown) => a === b,
  }
}

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

/// Compute fine-grained changes between two ProseMirror documents.
/// When `options.range` is provided, only the specified region is diffed.
export function computeDocDiff(
  oldDoc: Node,
  newDoc: Node,
  options?: ComputeDocDiffOptions
): readonly Change[] {
  const oldSize = oldDoc.content.size
  const newSize = newDoc.content.size
  const minSize = Math.min(oldSize, newSize)
  const from = Math.max(0, Math.min(options?.range?.from ?? 0, minSize))
  const toOld = Math.max(from, Math.min(options?.range?.to ?? oldSize, oldSize))
  const toNew = Math.max(from, Math.min(options?.range?.to ?? newSize, newSize))

  const step = new ReplaceStep(
    from,
    toOld,
    new Slice(newDoc.content.cut(from, toNew), 0, 0)
  )

  const encoder = createDiffEncoder(options?.ignoreAttrs)
  const changeSet = ChangeSet.create(oldDoc, undefined, encoder).addSteps(
    newDoc,
    [step.getMap()],
    null
  )

  return changeSet.changes
}
