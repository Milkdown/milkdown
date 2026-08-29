/// mdast container types whose content is flow (block-level).
/// Kept in one place because two plugins must agree on it:
/// `remarkHtmlTransformer` wraps html children of these containers into
/// paragraphs, and `remarkPreserveEmptyLinePlugin` folds a block-level
/// `<br>` inside them into an empty paragraph when the transformer has
/// not run.
export const BLOCK_CONTAINER_TYPES = new Set([
  'root',
  'blockquote',
  'listItem',
  'footnoteDefinition',
])
