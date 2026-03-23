import type { Ctx } from '@milkdown/kit/ctx'
import type { Selection } from '@milkdown/kit/prose/state'

import { Icon } from '@milkdown/kit/component'
import { editorCtx, EditorStatus } from '@milkdown/kit/core'
import clsx from 'clsx'
import {
  defineComponent,
  type Ref,
  type ShallowRef,
  h,
  Fragment,
  computed,
} from 'vue'

import type { ToolbarFeatureConfig } from '.'

import { getGroups, type ToolbarItem } from './config'

// oxlint-disable-next-line no-unused-expressions
h
// oxlint-disable-next-line no-unused-expressions
Fragment

type ToolbarProps = {
  ctx: Ctx
  hide: () => void
  show: Ref<boolean>
  selection: ShallowRef<Selection>
  config?: ToolbarFeatureConfig
}

export const Toolbar = defineComponent<ToolbarProps>({
  props: {
    ctx: {
      type: Object,
      required: true,
    },
    hide: {
      type: Function,
      required: true,
    },
    show: {
      type: Object,
      required: true,
    },
    selection: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const { ctx, config } = props

    const onClick = (fn: (ctx: Ctx) => void) => (e: MouseEvent) => {
      e.preventDefault()
      if (ctx) {
        fn(ctx)
      }
    }

    function checkActive(checker: ToolbarItem['active']) {
      // make sure the function subscribed to vue reactive
      // oxlint-disable-next-line no-unused-expressions
      props.selection.value
      // Check if the edtior is ready
      const status = ctx.get(editorCtx).status
      if (status !== EditorStatus.Created) return false

      return checker(ctx)
    }

    const groupInfo = computed(() => getGroups(config, ctx))

    return () => {
      return (
        <>
          {groupInfo.value
            .map((group) => {
              return group.items.map((item) => {
                return (
                  <button
                    type="button"
                    class={clsx(
                      'toolbar-item',
                      ctx && checkActive(item.active) && 'active'
                    )}
                    onPointerdown={onClick(item.onRun)}
                  >
                    <Icon icon={item.icon} />
                  </button>
                )
              })
            })
            .reduce((acc, curr, index) => {
              if (index === 0) {
                acc.push(...curr)
              } else {
                acc.push(<div class="divider"></div>, ...curr)
              }
              return acc
            }, [])}
        </>
      )
    }
  },
})
