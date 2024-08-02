import { imageBlockComponent, imageBlockConfig } from '@milkdown/kit/component/image-block'
import { imageInlineComponent, inlineImageConfig } from '@milkdown/kit/component/image-inline'
import { html } from 'atomico'
import type { DefineFeature } from '../shared'

const imageIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clip-path="url(#clip0_1013_1596)">
      <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#817567"/>
    </g>
    <defs>
      <clipPath id="clip0_1013_1596">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
`

const confirmIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clip-path="url(#clip0_1013_1606)">
      <path d="M9.00012 16.1998L5.50012 12.6998C5.11012 12.3098 4.49012 12.3098 4.10012 12.6998C3.71012 13.0898 3.71012 13.7098 4.10012 14.0998L8.29012 18.2898C8.68012 18.6798 9.31012 18.6798 9.70012 18.2898L20.3001 7.69982C20.6901 7.30982 20.6901 6.68982 20.3001 6.29982C19.9101 5.90982 19.2901 5.90982 18.9001 6.29982L9.00012 16.1998Z" fill="#817567"/>
    </g>
    <defs>
      <clipPath id="clip0_1013_1606">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
`

const captionIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12z"/></svg>
`

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
