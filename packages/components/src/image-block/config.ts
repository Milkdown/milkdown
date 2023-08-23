/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import { html } from 'atomico'
import { chatBubble, edit, image, upload } from '../__internal__/icons'

export type ImageBlockConfig = {
  imageIcon: () => ReturnType<typeof html>
  editIcon: () => ReturnType<typeof html>
  captionIcon: () => ReturnType<typeof html>
  uploadButton: () => ReturnType<typeof html>
  confirmButton: () => ReturnType<typeof html>
  uploadPlaceholderText: string
  captionPlaceholderText: string
  onUpload: (file: File) => Promise<string>
}

export const defaultConfig: ImageBlockConfig = {
  imageIcon: () => image,
  editIcon: () => edit,
  captionIcon: () => chatBubble,
  uploadButton: () => html`${upload} Upload file`,
  confirmButton: () => html`Confirm ⏎`,
  uploadPlaceholderText: 'or paste the image link ...',
  captionPlaceholderText: 'Image caption',
  onUpload: file => Promise.resolve(URL.createObjectURL(file)),
}

export const imageBlockConfig = $ctx(defaultConfig, 'imageBlockConfigCtx')
