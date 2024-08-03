import type { Editor } from '@milkdown/kit/core'
import type { html } from 'atomico'

export type DefineFeature<Config = unknown> = (editor: Editor, config?: Config) => void | Promise<void>

export type Icon = () => HTMLElement | ReturnType<typeof html> | string | null
