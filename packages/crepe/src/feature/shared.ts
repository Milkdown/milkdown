import type { Editor } from '@milkdown/kit/core'

export type DefineFeature<Config = unknown> = (
  editor: Editor,
  config?: Config
) => void | Promise<void>

export type Icon = () => string | null
