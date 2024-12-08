import type { Meta, StoryObj } from '@storybook/html'
import { imageInlineComponent } from '@milkdown/kit/component/image-inline'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './inline-image-block.css?inline'

const meta: Meta = {
  title: 'Components/Inline Image Block',
}

export default meta

const logo = `
![typescript](/typescript-label.svg)
`

const empty = `
![]()
`

export const Empty: StoryObj<CommonArgs> = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor.use(imageInlineComponent)
    })
  },
  args: {
    readonly: false,
    defaultValue: empty,
  },
}

export const Logo: StoryObj<CommonArgs> = {
  ...Empty,
  args: {
    readonly: false,
    defaultValue: logo,
  },
}
