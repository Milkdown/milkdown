import { $ctx } from '@milkdown/utils'
import { html } from 'atomico'
import { withMeta } from '../__internal__/meta'

export interface InlineImageConfig {
  imageIcon: () => ReturnType<typeof html>
  uploadButton: () => ReturnType<typeof html>
  confirmButton: () => ReturnType<typeof html>
  uploadPlaceholderText: string
  onUpload: (file: File) => Promise<string>
}

export const defaultInlineImageConfig: InlineImageConfig = {
  imageIcon: () => '🌌',
  uploadButton: () => html`Upload`,
  confirmButton: () => html`⏎`,
  uploadPlaceholderText: '/Paste',
  onUpload: file => Promise.resolve(URL.createObjectURL(file)),
}

export const inlineImageConfig = $ctx(defaultInlineImageConfig, 'inlineImageConfigCtx')

withMeta(inlineImageConfig, {
  displayName: 'Config<image-inline>',
  group: 'ImageInline',
})
