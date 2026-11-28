import type { Node } from '@milkdown/prose/model'
import type { MarkdownSource } from '@milkdown/transformer'

import { createSlice } from '@milkdown/ctx'

/// The markdown that each document of this editor was parsed from. Every
/// editor has a map of its own: the parser plugin injects a new one, so
/// two editors on a page never see the sources of each other.
export const parsedSourcesCtx = createSlice(
  new WeakMap<Node, MarkdownSource>(),
  'parsedSources'
)
