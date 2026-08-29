/// mdast container types whose content is flow (block-level).
/// Kept in one place because two plugins must agree on it:
/// `remarkHtmlTransformer` wraps html children of these containers into
/// paragraphs, and `remarkPreserveEmptyLinePlugin` folds a block-level
/// `<br>` inside them into an empty paragraph when the transformer has
/// not run.
///
/// Known limitation: a serialized empty-line placeholder inside a block
/// container NOT in this set is kept as an inline atom in a block-only
/// slot, and the parser then drops that container on load. Third-party
/// containers (e.g. remark-directive) cannot register here today; making
/// this a `$ctx` slice (the `hardbreakFilterNodes` pattern) is the
/// intended follow-up.
export const BLOCK_CONTAINER_TYPES = new Set([
  'root',
  'blockquote',
  'listItem',
  'footnoteDefinition',
])
