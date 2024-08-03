import { imageBlockComponent, imageBlockConfig } from '@milkdown/kit/component/image-block'
import { imageInlineComponent, inlineImageConfig } from '@milkdown/kit/component/image-inline'
import type { DefineFeature, Icon } from '../shared'
import { captionIcon, confirmIcon, imageIcon } from '../../icons'

interface ImageBlockConfig {
  imageIcon: Icon
  confirmButton: Icon
  captionIcon: Icon
}

export type ImageBlockFeatureConfig = Partial<ImageBlockConfig>

export const defineFeature: DefineFeature<ImageBlockFeatureConfig> = (editor, config) => {
  editor
    .config((ctx) => {
      ctx.update(inlineImageConfig.key, value => ({
        ...value,
        imageIcon: config?.imageIcon ?? (() => imageIcon),
        confirmButton: config?.confirmButton ?? (() => confirmIcon),
        uploadPlaceholderText: 'or paste link',
      }))
      ctx.update(imageBlockConfig.key, value => ({
        ...value,
        imageIcon: config?.imageIcon ?? (() => imageIcon),
        captionIcon: config?.captionIcon ?? (() => captionIcon),
        confirmButton: () => 'Confirm',
        captionPlaceholderText: 'Write Image Caption',
      }))
    })
    .use(imageBlockComponent)
    .use(imageInlineComponent)
}
