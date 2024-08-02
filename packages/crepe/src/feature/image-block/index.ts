import { imageBlockComponent, imageBlockConfig } from '@milkdown/kit/component/image-block'
import { imageInlineComponent, inlineImageConfig } from '@milkdown/kit/component/image-inline'
import { html } from 'atomico'
import type { DefineFeature } from '../shared'
import { captionIcon, confirmIcon, imageIcon } from '../../icons'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config((ctx) => {
      ctx.update(inlineImageConfig.key, value => ({
        ...value,
        imageIcon: () => imageIcon,
        confirmButton: () => confirmIcon,
        uploadPlaceholderText: 'or paste link',
      }))
      ctx.update(imageBlockConfig.key, value => ({
        ...value,
        imageIcon: () => imageIcon,
        captionIcon: () => captionIcon,
        confirmButton: () => html`Confirm`,
        captionPlaceholderText: 'Write Image Caption',
      }))
    })
    .use(imageBlockComponent)
    .use(imageInlineComponent)
}
