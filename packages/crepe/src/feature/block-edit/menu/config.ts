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
  if (config?.textGroup !== null) {
    const textGroup = groupBuilder.addGroup(
      'text',
      config?.textGroup?.label ?? 'Text'
    )
    if (config?.textGroup?.text !== null) {
      textGroup.addItem('text', {
        label: config?.textGroup?.text?.label ?? 'Text',
        icon: config?.textGroup?.text?.icon ?? textIcon,
        onRun: (ctx) => {
          const commands = ctx.get(commandsCtx)
          const paragraph = paragraphSchema.type(ctx)

          commands.call(clearTextInCurrentBlockCommand.key)
          commands.call(setBlockTypeCommand.key, {
            nodeType: paragraph,
          })
        },
      })
    }

    if (config?.textGroup?.h1 !== null) {
      textGroup.addItem('h1', {
        label: config?.textGroup?.h1?.label ?? 'Heading 1',
        icon: config?.textGroup?.h1?.icon ?? h1Icon,
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
    }

    if (config?.textGroup?.h2 !== null) {
      textGroup.addItem('h2', {
        label: config?.textGroup?.h2?.label ?? 'Heading 2',
        icon: config?.textGroup?.h2?.icon ?? h2Icon,
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
    }

    if (config?.textGroup?.h3 !== null) {
      textGroup.addItem('h3', {
        label: config?.textGroup?.h3?.label ?? 'Heading 3',
        icon: config?.textGroup?.h3?.icon ?? h3Icon,
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
    }

    if (config?.textGroup?.h4 !== null) {
      textGroup.addItem('h4', {
        label: config?.textGroup?.h4?.label ?? 'Heading 4',
        icon: config?.textGroup?.h4?.icon ?? h4Icon,
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
    }

    if (config?.textGroup?.h5 !== null) {
      textGroup.addItem('h5', {
        label: config?.textGroup?.h5?.label ?? 'Heading 5',
        icon: config?.textGroup?.h5?.icon ?? h5Icon,
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
    }

    if (config?.textGroup?.h6 !== null) {
      textGroup.addItem('h6', {
        label: config?.textGroup?.h6?.label ?? 'Heading 6',
        icon: config?.textGroup?.h6?.icon ?? h6Icon,
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
    }

    if (config?.textGroup?.quote !== null) {
      textGroup.addItem('quote', {
        label: config?.textGroup?.quote?.label ?? 'Quote',
        icon: config?.textGroup?.quote?.icon ?? quoteIcon,
        onRun: (ctx) => {
          const commands = ctx.get(commandsCtx)
          const blockquote = blockquoteSchema.type(ctx)

          commands.call(clearTextInCurrentBlockCommand.key)
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: blockquote,
          })
        },
      })
    }

    if (config?.textGroup?.divider !== null) {
      textGroup.addItem('divider', {
        label: config?.textGroup?.divider?.label ?? 'Divider',
        icon: config?.textGroup?.divider?.icon ?? dividerIcon,
        onRun: (ctx) => {
          const commands = ctx.get(commandsCtx)
          const hr = hrSchema.type(ctx)

          commands.call(clearTextInCurrentBlockCommand.key)
          commands.call(addBlockTypeCommand.key, {
            nodeType: hr,
          })
        },
      })
    }
  }

  if (config?.listGroup !== null) {
    const listGroup = groupBuilder.addGroup(
      'list',
      config?.listGroup?.label ?? 'List'
    )
    if (config?.listGroup?.bulletList !== null) {
      listGroup.addItem('bullet-list', {
        label: config?.listGroup?.bulletList?.label ?? 'Bullet List',
        icon: config?.listGroup?.bulletList?.icon ?? bulletListIcon,
        onRun: (ctx) => {
          const commands = ctx.get(commandsCtx)
          const bulletList = bulletListSchema.type(ctx)

          commands.call(clearTextInCurrentBlockCommand.key)
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: bulletList,
          })
        },
      })
    }

    if (config?.listGroup?.orderedList !== null) {
      listGroup.addItem('ordered-list', {
        label: config?.listGroup?.orderedList?.label ?? 'Ordered List',
        icon: config?.listGroup?.orderedList?.icon ?? orderedListIcon,
        onRun: (ctx) => {
          const commands = ctx.get(commandsCtx)
          const orderedList = orderedListSchema.type(ctx)

          commands.call(clearTextInCurrentBlockCommand.key)
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: orderedList,
          })
        },
      })
    }

    if (config?.listGroup?.taskList !== null) {
      listGroup.addItem('task-list', {
        label: config?.listGroup?.taskList?.label ?? 'Task List',
        icon: config?.listGroup?.taskList?.icon ?? todoListIcon,
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
    }
  }

  if (config?.advancedGroup !== null) {
    const advancedGroup = groupBuilder.addGroup(
      'advanced',
      config?.advancedGroup?.label ?? 'Advanced'
    )

    if (config?.advancedGroup?.image !== null && isImageBlockEnabled) {
      advancedGroup.addItem('image', {
        label: config?.advancedGroup?.image?.label ?? 'Image',
        icon: config?.advancedGroup?.image?.icon ?? imageIcon,
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

    if (config?.advancedGroup?.codeBlock !== null) {
      advancedGroup.addItem('code', {
        label: config?.advancedGroup?.codeBlock?.label ?? 'Code',
        icon: config?.advancedGroup?.codeBlock?.icon ?? codeIcon,
        onRun: (ctx) => {
          const commands = ctx.get(commandsCtx)
          const codeBlock = codeBlockSchema.type(ctx)

          commands.call(clearTextInCurrentBlockCommand.key)
          commands.call(setBlockTypeCommand.key, {
            nodeType: codeBlock,
          })
        },
      })
    }

    if (config?.advancedGroup?.table !== null && isTableEnabled) {
      advancedGroup.addItem('table', {
        label: config?.advancedGroup?.table?.label ?? 'Table',
        icon: config?.advancedGroup?.table?.icon ?? tableIcon,
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

    if (config?.advancedGroup?.math !== null && isLatexEnabled) {
      advancedGroup.addItem('math', {
        label: config?.advancedGroup?.math?.label ?? 'Math',
        icon: config?.advancedGroup?.math?.icon ?? functionsIcon,
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
