/// <reference types="vite/client" />

import type { Editor, commandsCtx } from '@milkdown/core'
import type { Crepe } from '@milkdown/crepe'
import type { Telemetry } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'

declare global {
  var __milkdown__: Editor

  var __view__: EditorView
  var __setMarkdown__: (markdown: string) => void
  var __getMarkdown__: () => string

  var __inspect__: () => Telemetry[]

  var __crepe__: Crepe

  var __beforeCrepeCreate__: (crepe: Crepe) => void
  var __afterCrepeCreated__: (crepe: Crepe) => void
  var __commandsCtx__: typeof commandsCtx

  var commands: {
    toggleStrong?: () => void
    toggleEmphasis?: () => void
    addTable?: (x?: number, y?: number) => void
    addTable2?: (x?: number, y?: number) => void
  }
}
