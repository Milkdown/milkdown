import type { Ctx } from '@milkdown/kit/ctx'
import type { MarkType } from '@milkdown/kit/prose/model'

import { imageBlockSchema } from '@milkdown/kit/component/image-block'
import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import {
  addBlockTypeCommand,
  blockquoteSchema,
  bulletListSchema,
  codeBlockSchema,
  headingSchema,
  hrSchema,
  listItemSchema,
  orderedListSchema,
  paragraphSchema,
  selectTextNearPosCommand,
  setBlockTypeCommand,
  wrapInBlockTypeCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
  emphasisSchema,
  inlineCodeSchema,
  strongSchema,
  linkSchema,
  isMarkSelectedCommand,
} from '@milkdown/kit/preset/commonmark'
import {
  strikethroughSchema,
  toggleStrikethroughCommand,
  createTable,
} from '@milkdown/kit/preset/gfm'
import { TextSelection } from '@milkdown/kit/prose/state'

import type { TopBarFeatureConfig } from '.'

import { useCrepeFeatures } from '../../core/slice'
import { CrepeFeature } from '../../feature'
import {
  boldIcon,
  bulletListIcon,
  chevronDownIcon,
  codeBlockIcon,
  codeIcon,
  dividerIcon,
  functionsIcon,
  imageIcon,
  italicIcon,
  linkIcon,
  orderedListIcon,
  quoteIcon,
  strikethroughIcon,
  tableIcon,
  todoListIcon,
} from '../../icons'
import { GroupBuilder } from '../../utils/group-builder'

export interface TopBarSelectorOption {
  label: string
  onSelect: (ctx: Ctx) => void
}

export interface TopBarSelector {
  options: TopBarSelectorOption[]
  activeLabel: (ctx: Ctx) => string
  chevronIcon?: string
}

export type TopBarItem = {
  active: (ctx: Ctx) => boolean
  icon: string
  selector?: TopBarSelector
}

export type HeadingOption = {
  label: string
  level: number | null
}

export const defaultHeadingOptions: HeadingOption[] = [
  { label: 'Paragraph', level: null },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
  { label: 'Heading 4', level: 4 },
  { label: 'Heading 5', level: 5 },
  { label: 'Heading 6', level: 6 },
]

export function getCurrentHeading(
  ctx: Ctx,
  options?: HeadingOption[]
): HeadingOption {
  const headingOptions = options ?? defaultHeadingOptions
  const view = ctx.get(editorViewCtx)
  const { $from } = view.state.selection
  const node = $from.parent

  const paragraphOption =
    headingOptions.find((o) => o.level === null) ?? headingOptions[0]!

  if (node.type === headingSchema.type(ctx)) {
    const level = node.attrs.level as number
    return headingOptions.find((o) => o.level === level) ?? paragraphOption
  }

  return paragraphOption
}

export function setHeading(ctx: Ctx, level: number | null) {
  const commands = ctx.get(commandsCtx)
  if (level === null || level === undefined) {
    const paragraph = paragraphSchema.type(ctx)
    commands.call(setBlockTypeCommand.key, { nodeType: paragraph })
  } else {
    const heading = headingSchema.type(ctx)
    commands.call(setBlockTypeCommand.key, {
      nodeType: heading,
      attrs: { level },
    })
  }
}

function isMarkActive(ctx: Ctx, markType: MarkType): boolean {
  const commands = ctx.get(commandsCtx)
  const selected = commands.call(isMarkSelectedCommand.key, markType)
  if (selected) return true

  const view = ctx.get(editorViewCtx)
  const { state } = view

  // Check stored marks (pending marks for next input)
  if (state.storedMarks) {
    return state.storedMarks.some((m) => m.type === markType)
  }

  // Check marks at cursor position (collapsed selection inside marked text)
  if (state.selection instanceof TextSelection) {
    const { $cursor } = state.selection
    if ($cursor) {
      return $cursor.marks().some((m) => m.type === markType)
    }
  }

  return false
}

export function buildHeadingSelector(
  headingOptions?: HeadingOption[],
  chevronIcon?: string
): TopBarItem {
  const options = headingOptions ?? defaultHeadingOptions
  return {
    icon: '',
    active: () => false,
    selector: {
      chevronIcon: chevronIcon ?? chevronDownIcon,
      activeLabel: (ctx) => getCurrentHeading(ctx, options).label,
      options: options.map((opt) => ({
        label: opt.label,
        onSelect: (ctx) => setHeading(ctx, opt.level),
      })),
    },
  }
}

export function getGroups(config?: TopBarFeatureConfig, ctx?: Ctx) {
  const flags = ctx && useCrepeFeatures(ctx).get()
  const isLatexEnabled = flags?.includes(CrepeFeature.Latex)
  const isImageBlockEnabled = flags?.includes(CrepeFeature.ImageBlock)
  const isTableEnabled = flags?.includes(CrepeFeature.Table)

  const groupBuilder = new GroupBuilder<TopBarItem>()

  // Heading selector group
  groupBuilder.addGroup('heading', 'Heading').addItem('heading-selector', {
    ...buildHeadingSelector(config?.headingOptions, config?.chevronDownIcon),
  })

  // Formatting group
  groupBuilder
    .addGroup('formatting', 'Formatting')
    .addItem('bold', {
      icon: config?.boldIcon ?? boldIcon,
      active: (ctx) => isMarkActive(ctx, strongSchema.type(ctx)),
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrongCommand.key)
      },
    })
    .addItem('italic', {
      icon: config?.italicIcon ?? italicIcon,
      active: (ctx) => isMarkActive(ctx, emphasisSchema.type(ctx)),
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleEmphasisCommand.key)
      },
    })
    .addItem('strikethrough', {
      icon: config?.strikethroughIcon ?? strikethroughIcon,
      active: (ctx) => isMarkActive(ctx, strikethroughSchema.type(ctx)),
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrikethroughCommand.key)
      },
    })
    .addItem('code', {
      icon: config?.codeIcon ?? codeIcon,
      active: (ctx) => isMarkActive(ctx, inlineCodeSchema.type(ctx)),
      onRun: (ctx) => {
        const view = ctx.get(editorViewCtx)
        const { state } = view
        if (state.selection.empty) {
          // toggleInlineCodeCommand doesn't support empty selection,
          // so handle stored marks manually
          const markType = inlineCodeSchema.type(ctx)
          const has = isMarkActive(ctx, markType)
          if (has) {
            view.dispatch(state.tr.removeStoredMark(markType))
          } else {
            view.dispatch(state.tr.addStoredMark(markType.create()))
          }
        } else {
          const commands = ctx.get(commandsCtx)
          commands.call(toggleInlineCodeCommand.key)
        }
      },
    })

  // List group
  groupBuilder
    .addGroup('list', 'List')
    .addItem('bullet-list', {
      icon: config?.bulletListIcon ?? bulletListIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const bulletList = bulletListSchema.type(ctx)
        commands.call(wrapInBlockTypeCommand.key, { nodeType: bulletList })
      },
    })
    .addItem('ordered-list', {
      icon: config?.orderedListIcon ?? orderedListIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const orderedList = orderedListSchema.type(ctx)
        commands.call(wrapInBlockTypeCommand.key, { nodeType: orderedList })
      },
    })
    .addItem('task-list', {
      icon: config?.taskListIcon ?? todoListIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const listItem = listItemSchema.type(ctx)
        commands.call(wrapInBlockTypeCommand.key, {
          nodeType: listItem,
          attrs: { checked: false },
        })
      },
    })

  // Insert group
  const insertGroup = groupBuilder.addGroup('insert', 'Insert')
  insertGroup.addItem('link', {
    icon: config?.linkIcon ?? linkIcon,
    active: (ctx) => isMarkActive(ctx, linkSchema.type(ctx)),
    onRun: (ctx) => {
      const view = ctx.get(editorViewCtx)
      const { state } = view
      const markType = linkSchema.type(ctx)

      // When cursor is inside a link with empty selection,
      // remove the stored link mark so next input won't be a link
      if (state.selection.empty && isMarkActive(ctx, markType)) {
        view.dispatch(state.tr.removeStoredMark(markType))
        return
      }

      const commands = ctx.get(commandsCtx)
      commands.call(toggleLinkCommand.key)
    },
  })

  if (isImageBlockEnabled) {
    insertGroup.addItem('image', {
      icon: config?.imageIcon ?? imageIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const imageBlock = imageBlockSchema.type(ctx)
        commands.call(addBlockTypeCommand.key, { nodeType: imageBlock })
      },
    })
  }

  if (isTableEnabled) {
    insertGroup.addItem('table', {
      icon: config?.tableIcon ?? tableIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const view = ctx.get(editorViewCtx)
        const { from } = view.state.selection
        commands.call(addBlockTypeCommand.key, {
          nodeType: createTable(ctx, 3, 3),
        })
        commands.call(selectTextNearPosCommand.key, { pos: from })
      },
    })
  }

  // Block group
  const blockGroup = groupBuilder.addGroup('block', 'Block')
  blockGroup.addItem('code-block', {
    icon: config?.codeBlockIcon ?? codeBlockIcon,
    active: () => false,
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const codeBlock = codeBlockSchema.type(ctx)
      commands.call(setBlockTypeCommand.key, { nodeType: codeBlock })
    },
  })

  if (isLatexEnabled) {
    blockGroup.addItem('math', {
      icon: config?.mathIcon ?? functionsIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const codeBlock = codeBlockSchema.type(ctx)
        commands.call(addBlockTypeCommand.key, {
          nodeType: codeBlock,
          attrs: { language: 'LaTeX' },
        })
      },
    })
  }

  // More group
  groupBuilder
    .addGroup('more', 'More')
    .addItem('quote', {
      icon: config?.quoteIcon ?? quoteIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const blockquote = blockquoteSchema.type(ctx)
        commands.call(wrapInBlockTypeCommand.key, { nodeType: blockquote })
      },
    })
    .addItem('hr', {
      icon: config?.hrIcon ?? dividerIcon,
      active: () => false,
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const hr = hrSchema.type(ctx)
        commands.call(addBlockTypeCommand.key, { nodeType: hr })
      },
    })

  config?.buildTopBar?.(groupBuilder)

  return groupBuilder.build()
}
