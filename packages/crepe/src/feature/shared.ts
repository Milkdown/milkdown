import type { Editor } from 'milkdown/core'

export type DefineFeature<Config = unknown> = (editor: Editor, config?: Config) => void | Promise<void>
