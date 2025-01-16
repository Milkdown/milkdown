/// <reference types="cypress" />
/// <reference types="vite/client" />

import type { Editor } from '@milkdown/core'
import type { EditorView } from '@milkdown/prose/view'
import type { Telemetry } from '@milkdown/ctx'
import type { Crepe } from '@milkdown/crepe'

declare global {
  var __milkdown__: Editor

  var __view__: EditorView
  var __setMarkdown__: (markdown: string) => void
  var __getMarkdown__: () => string

  var __inspect__: () => Telemetry[]

  var __beforeCrepeCreate__: (crepe: Crepe) => void
  var __afterCrepeCreated__: (crepe: Crepe) => void

  var commands: {
    toggleStrong?: () => void
    toggleEmphasis?: () => void
    addTable?: (x?: number, y?: number) => void
    addTable2?: (x?: number, y?: number) => void
  }
}
