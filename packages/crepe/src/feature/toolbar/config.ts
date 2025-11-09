import type { Ctx } from '@milkdown/kit/ctx'

import { imageBlockSchema } from '@milkdown/kit/component/image-block'
import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx } from '@milkdown/kit/core'
import {
  addBlockTypeCommand,
  blockquoteSchema,
  bulletListSchema,
  clearTextInCurrentBlockCommand,
  headingSchema,
  hrSchema,
  inlineCodeSchema,
  isMarkSelectedCommand,
  linkSchema,
  listItemSchema,
  orderedListSchema,
  paragraphSchema,
  setBlockTypeCommand,
  toggleInlineCodeCommand,
  wrapInBlockTypeCommand,
} from '@milkdown/kit/preset/commonmark'

import type { ToolbarFeatureConfig } from '.'

import { CrepeFeature } from '..'
import { useCrepeFeatures } from '../../core/slice'
import {
  bulletListIcon,
  codeIcon,
  dividerIcon,
  h1Icon,
  h2Icon,
  h3Icon,
  h4Icon,
  h5Icon,
  h6Icon,
  imageIcon,
  linkIcon,
  markdownIcon,
  orderedListIcon,
  quoteIcon,
  textIcon,
  todoListIcon,
} from '../../icons'
import { GroupBuilder } from '../../utils/group-builder'

export type ToolbarItem = {
  active: (ctx: Ctx) => boolean
  icon: string
  id?: string
}

export function getGroups(config?: ToolbarFeatureConfig, ctx?: Ctx) {
  const groupBuilder = new GroupBuilder<ToolbarItem>()

  // Single group for all toolbar items (no dividers, all in one row)
  const mainGroup = groupBuilder.addGroup('main', 'Main')

  // Reordered toolbar items: 1, 2, 3, 4, 5, T, task, bullet, number, image, quote, link, line, code
  
  // 1. Heading 1
  mainGroup.addItem('h1', {
    icon: h1Icon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const heading = headingSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: heading,
        attrs: { level: 1 },
      })
    },
  })
  
  // 2. Heading 2
  mainGroup.addItem('h2', {
    icon: h2Icon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const heading = headingSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: heading,
        attrs: { level: 2 },
      })
    },
  })
  
  // 3. Heading 3
  mainGroup.addItem('h3', {
    icon: h3Icon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const heading = headingSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: heading,
        attrs: { level: 3 },
      })
    },
  })
  
  // 4. Heading 4
  mainGroup.addItem('h4', {
    icon: h4Icon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const heading = headingSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: heading,
        attrs: { level: 4 },
      })
    },
  })
  
  // 5. Heading 5
  mainGroup.addItem('h5', {
    icon: h5Icon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const heading = headingSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: heading,
        attrs: { level: 5 },
      })
    },
  })

  // 6. Text
  mainGroup.addItem('text', {
    icon: textIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const paragraph = paragraphSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: paragraph,
      })
    },
  })

  // 7. Task list
  mainGroup.addItem('task-list', {
    icon: todoListIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const listItem = listItemSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(wrapInBlockTypeCommand.key, {
        nodeType: listItem,
        attrs: { checked: false },
      })
    },
  })

  // 8. Bullet list
  mainGroup.addItem('bullet-list', {
    icon: bulletListIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const bulletList = bulletListSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(wrapInBlockTypeCommand.key, {
        nodeType: bulletList,
      })
    },
  })
  
  // 9. Ordered list
  mainGroup.addItem('ordered-list', {
    icon: orderedListIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const orderedList = orderedListSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(wrapInBlockTypeCommand.key, {
        nodeType: orderedList,
      })
    },
  })

  // 10. Image
  const flags = ctx && useCrepeFeatures(ctx).get()
  const isImageBlockEnabled = flags?.includes(CrepeFeature.ImageBlock)
  
  if (isImageBlockEnabled) {
    mainGroup.addItem('image', {
      icon: imageIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const imageBlock = imageBlockSchema.type(ctx)
        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(addBlockTypeCommand.key, {
          nodeType: imageBlock,
        })
      },
    })
  }
  
  // 11. Quote
  mainGroup.addItem('quote', {
    icon: quoteIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const blockquote = blockquoteSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(wrapInBlockTypeCommand.key, {
        nodeType: blockquote,
      })
    },
  })
  
  // 12. Link
  mainGroup.addItem('link', {
    icon: config?.linkIcon ?? linkIcon,
    active: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return commands.call(isMarkSelectedCommand.key, linkSchema.type(ctx))
    },
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      commands.call(toggleLinkCommand.key)
    },
  })
  
  // 13. Divider (line)
  mainGroup.addItem('divider', {
    icon: dividerIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const hr = hrSchema.type(ctx)
      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(addBlockTypeCommand.key, {
        nodeType: hr,
      })
    },
  })

  // 14. Code (inline code)
  mainGroup.addItem('code', {
    icon: config?.codeIcon ?? codeIcon,
    active: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return commands.call(
        isMarkSelectedCommand.key,
        inlineCodeSchema.type(ctx)
      )
    },
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      commands.call(toggleInlineCodeCommand.key)
    },
  })

  // Markdown view toggle
  mainGroup.addItem('markdown-view', {
    id: 'markdown-view',
    icon: markdownIcon,
    active: () => false,
    onRun: (ctx) => {
      // Toggle will be handled by the toolbar component
      const event = new CustomEvent('milkdown-toggle-markdown-view')
      document.dispatchEvent(event)
    },
  })

  config?.buildToolbar?.(groupBuilder)

  return groupBuilder.build()
}
