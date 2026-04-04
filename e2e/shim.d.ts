/* oxlint-disable no-var */
/// <reference types="node" />
/// <reference types="vite/client" />

import type { Editor, commandsCtx } from '@milkdown/core'
import type { Crepe } from '@milkdown/crepe'
import type { Telemetry } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import type { insert } from '@milkdown/utils'

declare global {
  var __milkdown__: Editor

  var __view__: EditorView
  var __setMarkdown__: (markdown: string) => void
  var __getMarkdown__: () => string

  var __inspect__: () => Telemetry[]

  var __crepe__: Crepe

  var __beforeCrepeCreate__: (crepe: Crepe) => void
  var __afterCrepeCreated__: (crepe: Crepe) => void

  var __imageBlockMaxWidth__: number | undefined
  var __imageBlockMaxHeight__: number | undefined
  var __commandsCtx__: typeof commandsCtx

  var commands: {
    toggleStrong?: () => void
    toggleEmphasis?: () => void
    addTable?: (x?: number, y?: number) => void
    addTable2?: (x?: number, y?: number) => void
  }

  var __macros__: {
    insert: typeof insert
  }

  var __applyDiff__: (markdown: string) => boolean
  var __acceptAll__: () => boolean
  var __rejectAll__: () => boolean
  var __clearDiff__: () => boolean
  var __acceptChunk__: (index: number) => boolean
  var __rejectChunk__: (index: number) => boolean

  var __startStreaming__: (options?: {
    insertAt?: 'cursor' | number
  }) => boolean
  var __pushChunk__: (token: string) => boolean
  var __endStreaming__: (options?: { diffReview?: boolean }) => boolean
  var __abortStreaming__: (options?: { keep?: boolean }) => boolean
}
