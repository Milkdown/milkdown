import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  superscriptAttr,
  superscriptSchema,
  textSpanAttr,
  textSpanSchema,
} from '../mark'
import { divAttr, divSchema, extendHeadingSchemaForAttrs } from '../node'

/// @internal
export const schema: MilkdownPlugin[] = [
  // Node schemas
  extendHeadingSchemaForAttrs,
  divAttr,
  divSchema,

  // Mark schemas
  superscriptAttr,
  superscriptSchema,
  textSpanAttr,
  textSpanSchema,
].flat()
