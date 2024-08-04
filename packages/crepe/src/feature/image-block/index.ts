import { imageBlockComponent, imageBlockConfig } from '@milkdown/kit/component/image-block'
import { imageInlineComponent, inlineImageConfig } from '@milkdown/kit/component/image-inline'
import type { DefineFeature, Icon } from '../shared'
import { captionIcon, confirmIcon, imageIcon } from '../../icons'

interface ImageBlockConfig {
  onUpload: (file: File) => Promise<string>

  inlineImageIcon: Icon
  inlineConfirmButton: Icon
  inlineUploadButton: Icon
  inlineUploadPlaceholderText: string
  inlineOnUpload: (file: File) => Promise<string>

  blockImageIcon: Icon
  blockConfirmButton: Icon
  blockCaptionIcon: Icon
  blockUploadButton: Icon
  blockCaptionPlaceholderText: string
  blockUploadPlaceholderText: string
  blockOnUpload: (file: File) => Promise<string>
}

export type ImageBlockFeatureConfig = Partial<ImageBlockConfig>

export const defineFeature: DefineFeature<ImageBlockFeatureConfig> = (editor, config) => {
  editor
    .config((ctx) => {
      ctx.update(inlineImageConfig.key, value => ({
        uploadButton: config?.inlineUploadButton ?? (() => 'Upload'),
        imageIcon: config?.inlineImageIcon ?? (() => imageIcon),
        confirmButton: config?.inlineConfirmButton ?? (() => confirmIcon),
        uploadPlaceholderText: config?.inlineUploadPlaceholderText ?? 'or paste link',
        onUpload: config?.inlineOnUpload ?? config?.onUpload ?? value.onUpload,
      }))
      ctx.update(imageBlockConfig.key, value => ({
        uploadButton: config?.blockUploadButton ?? (() => 'Upload file'),
        imageIcon: config?.blockImageIcon ?? (() => imageIcon),
        captionIcon: config?.blockCaptionIcon ?? (() => captionIcon),
        confirmButton: config?.blockConfirmButton ?? (() => 'Confirm'),
        captionPlaceholderText: config?.blockCaptionPlaceholderText ?? 'Write Image Caption',
        uploadPlaceholderText: config?.blockUploadPlaceholderText ?? 'or paste link',
        onUpload: config?.blockOnUpload ?? config?.onUpload ?? value.onUpload,
      }))
    })
    .use(imageBlockComponent)
    .use(imageInlineComponent)
}
