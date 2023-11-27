/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import { html } from 'atomico'
import { chatBubble, image } from '../__internal__/icons'
import { withMeta } from '../__internal__/meta'

export interface ImageBlockConfig {
  imageIcon: () => ReturnType<typeof html>
  captionIcon: () => ReturnType<typeof html>
  uploadButton: () => ReturnType<typeof html>
  confirmButton: () => ReturnType<typeof html>
  uploadPlaceholderText: string
  captionPlaceholderText: string
  onUpload: (file: File) => Promise<string>
}

export const defaultImageBlockConfig: ImageBlockConfig = {
  imageIcon: () => image,
  captionIcon: () => chatBubble,
  uploadButton: () => html`Upload file`,
  confirmButton: () => html`Confirm ⏎`,
  uploadPlaceholderText: 'or paste the image link ...',
  captionPlaceholderText: 'Image caption',
  onUpload: file => Promise.resolve(URL.createObjectURL(file)),
}

export const imageBlockConfig = $ctx(defaultImageBlockConfig, 'imageBlockConfigCtx')

withMeta(imageBlockConfig, {
  displayName: 'Config<image-block>',
  group: 'ImageBlock',
})
