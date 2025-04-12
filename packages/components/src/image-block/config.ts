import { $ctx } from '@milkdown/utils'
import { withMeta } from '../__internal__/meta'

export interface ImageBlockConfig {
  imageIcon: () => string | null
  captionIcon: () => string | null
  uploadButton: () => string | null
  confirmButton: () => string | null
  uploadPlaceholderText: string
  captionPlaceholderText: string
  onUpload: (file: File) => Promise<string>
  proxyDomURL?: (url: string) => Promise<string> | string
}

export const defaultImageBlockConfig: ImageBlockConfig = {
  imageIcon: () => '🌌',
  captionIcon: () => '💬',
  uploadButton: () => 'Upload file',
  confirmButton: () => 'Confirm ⏎',
  uploadPlaceholderText: 'or paste the image link ...',
  captionPlaceholderText: 'Image caption',
  onUpload: (file) => Promise.resolve(URL.createObjectURL(file)),
}

export const imageBlockConfig = $ctx(
  defaultImageBlockConfig,
  'imageBlockConfigCtx'
)

withMeta(imageBlockConfig, {
  displayName: 'Config<image-block>',
  group: 'ImageBlock',
})
