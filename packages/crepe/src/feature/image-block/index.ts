/* Copyright 2021, Milkdown by Mirone. */
import { imageBlockComponent } from '@milkdown/components/image-block'
import { imageInlineComponent } from '@milkdown/components/image-inline'
import type { DefineFeature } from '../shared'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .use(imageBlockComponent)
    .use(imageInlineComponent)
}
