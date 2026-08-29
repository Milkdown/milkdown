import type { Node } from '@milkdown/transformer'

/// Copy a childless leaf node (e.g. an mdast html node) without sharing
/// any nested objects (`position`, `data`) with the original; a
/// `children` property is never carried over.
export function cloneLeaf<T extends Node>(node: T): T {
  const copy = structuredClone(node)
  delete (copy as T & { children?: unknown }).children
  return copy
}
