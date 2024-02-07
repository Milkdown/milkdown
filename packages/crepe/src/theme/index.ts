/* Copyright 2021, Milkdown by Mirone. */

import type { Editor } from '@milkdown/core'

export enum CrepeTheme {
  Headless = 'headless',
  Classic = 'classic',
  ClassicDark = 'classic-dark',
}

export async function loadTheme(theme: CrepeTheme, editor: Editor) {
  switch (theme) {
    case CrepeTheme.Headless: {
      const { defineTheme } = await import('./headless')
      return defineTheme(editor)
    }
    case CrepeTheme.Classic: {
      const { defineTheme } = await import('./classic')
      return defineTheme(editor)
    }
    case CrepeTheme.ClassicDark: {
      const { defineTheme } = await import('./classic-dark')
      return defineTheme(editor)
    }
  }
}
