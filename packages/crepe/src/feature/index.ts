/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'

export enum CrepeFeature {
  CodeMirror = 'code-mirror',
  ListItem = 'list-item',
  LinkTooltip = 'link-tooltip',
  ImageBlock = 'image-block',
}

export const defaultFeatures: Record<CrepeFeature, boolean> = {
  [CrepeFeature.ListItem]: true,
  [CrepeFeature.LinkTooltip]: true,
  [CrepeFeature.ImageBlock]: true,
  [CrepeFeature.CodeMirror]: false,
}

export async function loadFeature(feature: CrepeFeature, editor: Editor) {
  switch (feature) {
    case CrepeFeature.CodeMirror: {
      const { defineFeature } = await import('./code-mirror')
      return defineFeature(editor)
    }
    case CrepeFeature.ListItem: {
      const { defineFeature } = await import('./list-item')
      return defineFeature(editor)
    }
    case CrepeFeature.LinkTooltip: {
      const { defineFeature } = await import('./link-tooltip')
      return defineFeature(editor)
    }
  }
}
