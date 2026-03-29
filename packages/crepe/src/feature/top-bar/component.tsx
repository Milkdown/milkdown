import type { Ctx } from '@milkdown/kit/ctx'

import { Icon } from '@milkdown/kit/component'
import { editorCtx, EditorStatus, editorViewCtx } from '@milkdown/kit/core'
import clsx from 'clsx'
import {
  defineComponent,
  type Ref,
  type VNode,
  h,
  Fragment,
  computed,
  ref,
  onMounted,
  onUnmounted,
} from 'vue'

import type { TopBarFeatureConfig } from '.'

import { keepAlive } from '../../utils/keep-alive'
import { getGroups, type TopBarItem, type TopBarSelector } from './config'

keepAlive(h, Fragment)

type TopBarProps = {
  ctx: Ctx
  version: Ref<number>
  config?: TopBarFeatureConfig
}

export const TopBar = defineComponent<TopBarProps>({
  props: {
    ctx: {
      type: Object,
      required: true,
    },
    version: {
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
    const openSelectorKey = ref<string | null>(null)

    const onClick = (fn: (ctx: Ctx) => void) => (e: MouseEvent) => {
      e.preventDefault()
      if (ctx) {
        fn(ctx)
      }
    }

    function isReady() {
      const status = ctx.get(editorCtx).status
      return status === EditorStatus.Created
    }

    function subscribeState() {
      keepAlive(props.version.value)
    }

    function checkActive(checker: TopBarItem['active']) {
      subscribeState()
      if (!isReady()) return false
      return checker(ctx)
    }

    function getSelectorLabel(selector: TopBarSelector): string {
      subscribeState()
      if (!isReady()) return selector.options[0]?.label ?? ''
      return selector.activeLabel(ctx)
    }

    function onToggleSelector(key: string, e: Event) {
      e.preventDefault()
      e.stopPropagation()
      openSelectorKey.value = openSelectorKey.value === key ? null : key
    }

    const clickOutsideHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.top-bar-heading-selector')) return
      openSelectorKey.value = null
    }

    onMounted(() => {
      window.addEventListener('click', clickOutsideHandler)
    })

    onUnmounted(() => {
      window.removeEventListener('click', clickOutsideHandler)
    })

    const groupInfo = computed(() => getGroups(config, ctx))

    function renderSelector(itemKey: string, selector: TopBarSelector): VNode {
      const isOpen = openSelectorKey.value === itemKey
      const activeLabel = getSelectorLabel(selector)

      return (
        <div key={itemKey} class="top-bar-heading-selector">
          <button
            type="button"
            class="top-bar-heading-button"
            onPointerdown={(e: Event) => onToggleSelector(itemKey, e)}
          >
            <span class="top-bar-heading-label">{activeLabel}</span>
            {selector.chevronIcon && (
              <span class="top-bar-chevron">
                <Icon icon={selector.chevronIcon} />
              </span>
            )}
          </button>
          {isOpen && (
            <div class="top-bar-heading-dropdown">
              {selector.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  class={clsx(
                    'top-bar-heading-option',
                    activeLabel === option.label && 'active'
                  )}
                  onPointerdown={(e: Event) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openSelectorKey.value = null
                    option.onSelect(ctx)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    function renderButton(
      item: TopBarItem & { key: string; onRun: (ctx: Ctx) => void }
    ): VNode {
      return (
        <button
          key={item.key}
          type="button"
          class={clsx('top-bar-item', checkActive(item.active) && 'active')}
          onPointerdown={onClick(item.onRun)}
        >
          <Icon icon={item.icon} />
        </button>
      )
    }

    return () => {
      const view = isReady() ? ctx.get(editorViewCtx) : null
      const isReadonly = view ? !view.editable : false

      if (isReadonly) return null

      return (
        <div class="top-bar-inner">
          {groupInfo.value
            .map((group) => {
              return group.items.map((item) => {
                if (item.selector) {
                  return renderSelector(item.key, item.selector)
                }
                if (!item.onRun) return null
                return renderButton(
                  item as TopBarItem & {
                    key: string
                    onRun: (ctx: Ctx) => void
                  }
                )
              })
            })
            .reduce((acc, curr, index) => {
              if (index === 0) {
                acc.push(...curr)
              } else {
                const groupKey = groupInfo.value[index]?.key ?? index
                acc.push(
                  <div key={`divider-${groupKey}`} class="top-bar-divider" />,
                  ...curr
                )
              }
              return acc
            }, [] as VNode[])}
        </div>
      )
    }
  },
})
