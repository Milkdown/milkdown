import type { Meta, StoryObj } from '@storybook/html'

import { diffComponent } from '@milkdown/kit/component/diff'
import { EditorStatus } from '@milkdown/kit/core'
import {
  diff,
  startDiffReviewCmd,
  acceptAllDiffsCmd,
  clearDiffReviewCmd,
} from '@milkdown/kit/plugin/diff'
import { callCommand } from '@milkdown/kit/utils'

import type { CommonArgs } from '../utils/shadow'

import { setupMilkdown } from '../utils/shadow'
import style from './diff.css?inline'

const meta: Meta<CommonArgs> = {
  title: 'Plugins/Diff',
}

export default meta

type Story = StoryObj<CommonArgs>

const originalMarkdown = `# Hello World

This is the first paragraph of the document. It contains some introductory text.

## Features

The editor supports many features including bold, italic, and code formatting.

Here is a list of items:

- First item
- Second item
- Third item

## Conclusion

Thank you for reading this document.`

const modifiedMarkdown = `# Hello Milkdown

This is the first paragraph of the document. It has been updated with new content.

## Features

The editor supports many powerful features including **bold**, *italic*, and \`code\` formatting.

Here is a list of items:

- First item
- Second item
- Third item
- Fourth item (new)

## API Integration

This is a brand new section about AI integration capabilities.

## Conclusion

Thank you for reading this improved document.`

export const Default: Story = {
  render: (args) => {
    const toolbar = document.createElement('div')
    toolbar.classList.add('diff-toolbar')

    const applyBtn = document.createElement('button')
    applyBtn.textContent = 'Apply Diff'
    applyBtn.classList.add('diff-toolbar-apply')

    const acceptAllBtn = document.createElement('button')
    acceptAllBtn.textContent = 'Accept All'
    acceptAllBtn.classList.add('diff-toolbar-accept-all')

    const clearBtn = document.createElement('button')
    clearBtn.textContent = 'Clear'
    clearBtn.classList.add('diff-toolbar-clear')

    toolbar.appendChild(applyBtn)
    toolbar.appendChild(acceptAllBtn)
    toolbar.appendChild(clearBtn)

    return setupMilkdown([style], args, (editor, _, wrapper) => {
      editor.use(diff).use(diffComponent)

      editor.onStatusChange((status) => {
        if (status === EditorStatus.Created) {
          wrapper.insertBefore(toolbar, wrapper.firstChild)

          applyBtn.addEventListener('click', () => {
            editor.action(callCommand(startDiffReviewCmd.key, modifiedMarkdown))
          })

          acceptAllBtn.addEventListener('click', () => {
            editor.action(callCommand(acceptAllDiffsCmd.key))
          })

          clearBtn.addEventListener('click', () => {
            editor.action(callCommand(clearDiffReviewCmd.key))
          })
        }
      })
    })
  },
  args: {
    defaultValue: originalMarkdown,
    readonly: false,
  },
}
