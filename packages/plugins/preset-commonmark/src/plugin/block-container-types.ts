import type { Ctx } from '@milkdown/ctx'

import { $ctx } from '@milkdown/utils'

import { withMeta } from '../__internal__'

// `footnoteDefinition` is a GFM type, and it ships in the defaults so a
// cherry-picked footnote composition round-trips without extra wiring.
// `hardbreakFilterNodes` ships 'table' for the same reason. The array is
// frozen and typed readonly, so an in-place mutation fails loudly
// instead of polluting every editor that shares the module.
const DEFAULT_BLOCK_CONTAINER_TYPES: readonly string[] = Object.freeze([
  'root',
  'blockquote',
  'listItem',
  'footnoteDefinition',
])

// Registering a phrasing container would make the consumers rewrite its
// inline `<br>` children into block paragraphs and the parser would drop
// the container with all of its content, so these types are ignored with
// a warning instead of being honored.
const KNOWN_PHRASING_TYPES = new Set([
  'paragraph',
  'heading',
  'tableCell',
  'link',
  'linkReference',
  'emphasis',
  'strong',
  'delete',
  'footnote',
])

/// This slice contains the mdast container types whose content is flow
/// (block-level). `remarkHtmlTransformer` wraps html children of these
/// containers into paragraphs, and `remarkPreserveEmptyLinePlugin` folds
/// a block-level `<br>` inside them into an empty paragraph.
///
/// Plugins that add their own **flow** containers should register their
/// mdast type names with `ctx.update(blockContainerTypes.key, (types) =>
/// [...types, 'myContainer'])`; otherwise a serialized empty-line
/// placeholder inside such a container cannot round-trip and the parser
/// drops the container. Never register a phrasing container, which holds
/// inline content. Such an entry is ignored with a warning, because
/// honoring it would corrupt a document.
///
/// Compositions that do not use the preset's composed `plugins` array
/// must `.use(blockContainerTypes)` before updating the slice; without
/// it the consumers fall back to the defaults.
export const blockContainerTypes = $ctx<
  readonly string[],
  'blockContainerTypes'
>(DEFAULT_BLOCK_CONTAINER_TYPES, 'blockContainerTypes')

withMeta(blockContainerTypes, {
  displayName: 'Ctx<blockContainerTypes>',
  group: 'Remark',
})

const warned = new Set<string>()

/// @internal
/// Resolve the registered container types as a Set, falling back to the
/// defaults in compositions that do not register the slice, and dropping
/// known phrasing types defensively.
export function getBlockContainerTypes(ctx: Ctx): ReadonlySet<string> {
  const types = ctx.isInjected(blockContainerTypes.key)
    ? ctx.get(blockContainerTypes.key)
    : DEFAULT_BLOCK_CONTAINER_TYPES

  const containers = new Set<string>()
  for (const type of types) {
    if (KNOWN_PHRASING_TYPES.has(type)) {
      if (!warned.has(type)) {
        warned.add(type)
        console.warn(
          `[milkdown/preset-commonmark] "${type}" holds phrasing content and cannot be a block container; it is ignored in blockContainerTypes.`
        )
      }
      continue
    }
    containers.add(type)
  }
  return containers
}
