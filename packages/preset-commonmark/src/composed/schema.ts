/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/core'
import { emphasisSchema, inlineCodeSchema, linkSchema, strongSchema } from '../mark'
import { blockquoteSchema, bulletListSchema, codeBlockSchema, docSchema, hardbreakSchema, headingIdGenerator, headingSchema, hrSchema, imageSchema, listItemSchema, orderedListSchema, paragraphSchema, textSchema } from '../node'

export const schema: MilkdownPlugin[] = [
  docSchema,

  paragraphSchema,
  headingIdGenerator,
  headingSchema,

  hardbreakSchema,
  blockquoteSchema,
  codeBlockSchema,
  hrSchema,
  imageSchema,

  bulletListSchema,
  orderedListSchema,
  listItemSchema,
  textSchema,

  emphasisSchema,
  strongSchema,
  inlineCodeSchema,
  linkSchema,
].flat()
