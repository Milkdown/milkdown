/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import { codeBlockComponent } from '@milkdown/components/code-block'

export function defineFeature(editor: Editor) {
  editor.use(codeBlockComponent)
}
