import type { Meta, StoryObj } from '@storybook/html'
import { imageBlockComponent } from '@milkdown/kit/component/image-block'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './image-block.css?inline'

const meta: Meta = {
  title: 'Components/Image Block',
}

export default meta

const logo = `
![0.5](/milkdown-logo.png)
`

const empty = `
![]()
`

export const Empty: StoryObj<CommonArgs> = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor.use(imageBlockComponent)
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
