import {
  imageBlockComponent,
  imageBlockConfig,
} from '@milkdown/kit/component/image-block'
import {
  imageInlineComponent,
  inlineImageConfig,
} from '@milkdown/kit/component/image-inline'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { captionIcon, imageIcon, confirmIcon } from '../../icons'
import { CrepeFeature } from '../index'

interface ImageBlockConfig {
  onUpload: (file: File) => Promise<string>
  proxyDomURL: (url: string) => Promise<string> | string

  inlineImageIcon: string
  inlineConfirmButton: string
  inlineUploadButton: string
  inlineUploadPlaceholderText: string
  inlineOnUpload: (file: File) => Promise<string>

  blockImageIcon: string
  blockConfirmButton: string
  blockCaptionIcon: string
  blockUploadButton: string
  blockCaptionPlaceholderText: string
  blockUploadPlaceholderText: string
  blockOnUpload: (file: File) => Promise<string>
}

export type ImageBlockFeatureConfig = Partial<ImageBlockConfig>

export const imageBlock: DefineFeature<ImageBlockFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.ImageBlock))
    .config((ctx) => {
      ctx.update(inlineImageConfig.key, (value) => ({
        uploadButton: config?.inlineUploadButton ?? 'Upload',
        imageIcon: config?.inlineImageIcon ?? imageIcon,
        confirmButton: config?.inlineConfirmButton ?? confirmIcon,
        uploadPlaceholderText:
          config?.inlineUploadPlaceholderText ?? 'or paste link',
        onUpload: config?.inlineOnUpload ?? config?.onUpload ?? value.onUpload,
        proxyDomURL: config?.proxyDomURL,
      }))
      ctx.update(imageBlockConfig.key, (value) => ({
        uploadButton: config?.blockUploadButton ?? 'Upload file',
        imageIcon: config?.blockImageIcon ?? imageIcon,
        captionIcon: config?.blockCaptionIcon ?? captionIcon,
        confirmButton: config?.blockConfirmButton ?? 'Confirm',
        captionPlaceholderText:
          config?.blockCaptionPlaceholderText ?? 'Write Image Caption',
        uploadPlaceholderText:
          config?.blockUploadPlaceholderText ?? 'or paste link',
        onUpload: config?.blockOnUpload ?? config?.onUpload ?? value.onUpload,
        proxyDomURL: config?.proxyDomURL,
      }))
    })
    .use(imageBlockComponent)
    .use(imageInlineComponent)
}
