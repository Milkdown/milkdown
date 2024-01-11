/* Copyright 2021, Milkdown by Mirone. */

import type { Editor } from '@milkdown/core'

export enum CrepeTheme {
  Classic = 'classic',
}

export async function loadTheme(theme: CrepeTheme, editor: Editor) {
  switch (theme) {
    case CrepeTheme.Classic: {
      const { defineTheme } = await import('./classic')
      return defineTheme(editor)
    }
  }
}
