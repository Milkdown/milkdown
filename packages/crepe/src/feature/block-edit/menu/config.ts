import type { Ctx } from '@milkdown/kit/ctx'

import { imageBlockSchema } from '@milkdown/kit/component/image-block'
import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import {
  addBlockTypeCommand,
  blockquoteSchema,
  bulletListSchema,
  clearTextInCurrentBlockCommand,
  codeBlockSchema,
  headingSchema,
  hrSchema,
  listItemSchema,
  orderedListSchema,
  paragraphSchema,
  selectTextNearPosCommand,
  setBlockTypeCommand,
  wrapInBlockTypeCommand,
} from '@milkdown/kit/preset/commonmark'
import { createTable } from '@milkdown/kit/preset/gfm'

import type { BlockEditFeatureConfig } from '../index'
import type { SlashMenuItem } from './utils'

import { useCrepeFeatures } from '../../../core/slice'
import { CrepeFeature } from '../../../feature'
import {
  bulletListIcon,
  codeIcon,
  dividerIcon,
  functionsIcon,
  h1Icon,
  h2Icon,
  h3Icon,
  h4Icon,
  h5Icon,
  h6Icon,
  imageIcon,
  orderedListIcon,
  quoteIcon,
  tableIcon,
  textIcon,
  todoListIcon,
} from '../../../icons'
import { GroupBuilder, type MenuItemGroup } from '../../../utils/group-builder'

export function getGroups(
  filter?: string,
  config?: BlockEditFeatureConfig,
  ctx?: Ctx
) {
  const flags = ctx && useCrepeFeatures(ctx).get()
  const isLatexEnabled = flags?.includes(CrepeFeature.Latex)
  const isImageBlockEnabled = flags?.includes(CrepeFeature.ImageBlock)
  const isTableEnabled = flags?.includes(CrepeFeature.Table)

  const groupBuilder = new GroupBuilder<SlashMenuItem>()
  groupBuilder
    .addGroup('text', config?.slashMenuTextGroupLabel ?? 'Text')
    .addItem('text', {
      label: config?.slashMenuTextLabel ?? 'Text',
      icon: config?.slashMenuTextIcon ?? textIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const paragraph = paragraphSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: paragraph,
        })
      },
    })
    .addItem('h1', {
      label: config?.slashMenuH1Label ?? 'Heading 1',
      icon: config?.slashMenuH1Icon ?? h1Icon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const heading = headingSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: heading,
          attrs: {
            level: 1,
          },
        })
      },
    })
    .addItem('h2', {
      label: config?.slashMenuH2Label ?? 'Heading 2',
      icon: config?.slashMenuH2Icon ?? h2Icon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const heading = headingSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: heading,
          attrs: {
            level: 2,
          },
        })
      },
    })
    .addItem('h3', {
      label: config?.slashMenuH3Label ?? 'Heading 3',
      icon: config?.slashMenuH3Icon ?? h3Icon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const heading = headingSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: heading,
          attrs: {
            level: 3,
          },
        })
      },
    })
    .addItem('h4', {
      label: config?.slashMenuH4Label ?? 'Heading 4',
      icon: config?.slashMenuH4Icon ?? h4Icon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const heading = headingSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: heading,
          attrs: {
            level: 4,
          },
        })
      },
    })
    .addItem('h5', {
      label: config?.slashMenuH5Label ?? 'Heading 5',
      icon: config?.slashMenuH5Icon ?? h5Icon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const heading = headingSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: heading,
          attrs: {
            level: 5,
          },
        })
      },
    })
    .addItem('h6', {
      label: config?.slashMenuH6Label ?? 'Heading 6',
      icon: config?.slashMenuH6Icon ?? h6Icon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const heading = headingSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(setBlockTypeCommand.key, {
          nodeType: heading,
          attrs: {
            level: 6,
          },
        })
      },
    })
    .addItem('quote', {
      label: config?.slashMenuQuoteLabel ?? 'Quote',
      icon: config?.slashMenuQuoteIcon ?? quoteIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const blockquote = blockquoteSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(wrapInBlockTypeCommand.key, {
          nodeType: blockquote,
        })
      },
    })
    .addItem('divider', {
      label: config?.slashMenuDividerLabel ?? 'Divider',
      icon: config?.slashMenuDividerIcon ?? dividerIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const hr = hrSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(addBlockTypeCommand.key, {
          nodeType: hr,
        })
      },
    })

  groupBuilder
    .addGroup('list', config?.slashMenuListGroupLabel ?? 'List')
    .addItem('bullet-list', {
      label: config?.slashMenuBulletListLabel ?? 'Bullet List',
      icon: config?.slashMenuBulletListIcon ?? bulletListIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const bulletList = bulletListSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(wrapInBlockTypeCommand.key, {
          nodeType: bulletList,
        })
      },
    })
    .addItem('ordered-list', {
      label: config?.slashMenuOrderedListLabel ?? 'Ordered List',
      icon: config?.slashMenuOrderedListIcon ?? orderedListIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const orderedList = orderedListSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(wrapInBlockTypeCommand.key, {
          nodeType: orderedList,
        })
      },
    })
    .addItem('todo-list', {
      label: config?.slashMenuTaskListLabel ?? 'Todo List',
      icon: config?.slashMenuTaskListIcon ?? todoListIcon,
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

  const advancedGroup = groupBuilder.addGroup(
    'advanced',
    config?.slashMenuAdvancedGroupLabel ?? 'Advanced'
  )

  if (isImageBlockEnabled) {
    advancedGroup.addItem('image', {
      label: config?.slashMenuImageLabel ?? 'Image',
      icon: config?.slashMenuImageIcon ?? imageIcon,
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

  advancedGroup.addItem('code', {
    label: config?.slashMenuCodeBlockLabel ?? 'Code',
    icon: config?.slashMenuCodeBlockIcon ?? codeIcon,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const codeBlock = codeBlockSchema.type(ctx)

      commands.call(clearTextInCurrentBlockCommand.key)
      commands.call(setBlockTypeCommand.key, {
        nodeType: codeBlock,
      })
    },
  })

  if (isTableEnabled) {
    advancedGroup.addItem('table', {
      label: config?.slashMenuTableLabel ?? 'Table',
      icon: config?.slashMenuTableIcon ?? tableIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const view = ctx.get(editorViewCtx)

        commands.call(clearTextInCurrentBlockCommand.key)

        // record the position before the table is inserted
        const { from } = view.state.selection
        commands.call(addBlockTypeCommand.key, {
          nodeType: createTable(ctx, 3, 3),
        })

        commands.call(selectTextNearPosCommand.key, {
          pos: from,
        })
      },
    })
  }

  if (isLatexEnabled) {
    advancedGroup.addItem('math', {
      label: config?.slashMenuMathLabel ?? 'Math',
      icon: config?.slashMenuMathIcon ?? functionsIcon,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const codeBlock = codeBlockSchema.type(ctx)

        commands.call(clearTextInCurrentBlockCommand.key)
        commands.call(addBlockTypeCommand.key, {
          nodeType: codeBlock,
          attrs: { language: 'LaTex' },
        })
      },
    })
  }

  config?.buildMenu?.(groupBuilder)

  let groups = groupBuilder.build()

  if (filter) {
    groups = groups
      .map((group) => {
        const items = group.items.filter((item) =>
          item.label.toLowerCase().includes(filter.toLowerCase())
        )

        return {
          ...group,
          items,
        }
      })
      .filter((group) => group.items.length > 0)
  }

  const items = groups.flatMap((groups) => groups.items)
  items.forEach((item, index) => {
    Object.assign(item, { index })
  })

  groups.reduce((acc, group) => {
    const end = acc + group.items.length
    Object.assign(group, {
      range: [acc, end],
    })
    return end
  }, 0)

  return {
    groups: groups as MenuItemGroup<SlashMenuItem>[],
    size: items.length,
  }
}
