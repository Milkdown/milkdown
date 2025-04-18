import type { Ctx } from '@milkdown/kit/ctx'

import { Icon } from '@milkdown/kit/component'
import {
  computed,
  defineComponent,
  onUnmounted,
  ref,
  watch,
  watchEffect,
  type Ref,
  h,
} from 'vue'

import type { BlockEditFeatureConfig } from '..'

import { getGroups } from './config'

h

type MenuProps = {
  ctx: Ctx
  show: Ref<boolean>
  filter: Ref<string>
  hide: () => void
  config?: BlockEditFeatureConfig
}

export const Menu = defineComponent<MenuProps>({
  props: {
    ctx: {
      type: Object,
      required: true,
    },
    show: {
      type: Object,
      required: true,
    },
    filter: {
      type: Object,
      required: true,
    },
    hide: {
      type: Function,
      required: true,
    },
    config: {
      type: Object,
      required: false,
    },
  },
  setup({ ctx, show, filter, hide, config }) {
    const host = ref<HTMLElement>()
    const groupInfo = computed(() => getGroups(filter.value, config, ctx))
    const hoverIndex = ref(0)
    const prevMousePosition = ref({ x: -999, y: -999 })

    const onPointerMove = (e: MouseEvent) => {
      const { x, y } = e
      prevMousePosition.value = { x, y }
    }

    watch([groupInfo, show], () => {
      const { size } = groupInfo.value
      if (size === 0 && show.value) hide()
      else if (hoverIndex.value >= size) hoverIndex.value = 0
    })

    const onHover = (
      index: number | ((prev: number) => number),
      after?: (index: number) => void
    ) => {
      const prevHoverIndex = hoverIndex.value
      const next = typeof index === 'function' ? index(prevHoverIndex) : index
      after?.(next)
      hoverIndex.value = next
    }

    const scrollToIndex = (index: number) => {
      const target = host.value?.querySelector<HTMLElement>(
        `[data-index="${index}"]`
      )
      const scrollRoot = host.value?.querySelector<HTMLElement>('.menu-groups')

      if (!target || !scrollRoot) return

      scrollRoot.scrollTop = target.offsetTop - scrollRoot.offsetTop
    }

    const runByIndex = (index: number) => {
      const item = groupInfo.value.groups
        .flatMap((group) => group.items)
        .at(index)
      if (item && ctx) item.onRun(ctx)

      hide()
    }

    const onKeydown = (e: KeyboardEvent) => {
      const { size, groups } = groupInfo.value
      if (e.key === 'Escape') {
        e.preventDefault()
        hide?.()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        return onHover(
          (index) => (index < size - 1 ? index + 1 : index),
          scrollToIndex
        )
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        return onHover(
          (index) => (index <= 0 ? index : index - 1),
          scrollToIndex
        )
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        return onHover((index) => {
          const group = groups.find(
            (group) => group.range[0] <= index && group.range[1] > index
          )
          if (!group) return index

          const prevGroup = groups[groups.indexOf(group) - 1]
          if (!prevGroup) return index

          return prevGroup.range[1] - 1
        }, scrollToIndex)
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        return onHover((index) => {
          const group = groups.find(
            (group) => group.range[0] <= index && group.range[1] > index
          )
          if (!group) return index

          const nextGroup = groups[groups.indexOf(group) + 1]
          if (!nextGroup) return index

          return nextGroup.range[0]
        }, scrollToIndex)
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        runByIndex(hoverIndex.value)
      }
    }

    const getOnPointerEnter = (index: number) => (e: MouseEvent) => {
      const prevPos = prevMousePosition.value
      if (!prevPos) return

      const { x, y } = e
      if (x === prevPos.x && y === prevPos.y) return

      onHover(index)
    }

    watchEffect(() => {
      const isShown = show.value
      if (isShown) {
        window.addEventListener('keydown', onKeydown, { capture: true })
      } else {
        window.removeEventListener('keydown', onKeydown, { capture: true })
      }
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown, { capture: true })
    })

    return () => {
      return (
        <div ref={host} onPointerdown={(e) => e.preventDefault()}>
          <nav class="tab-group">
            <ul>
              {groupInfo.value.groups.map((group) => (
                <li
                  key={group.key}
                  onPointerdown={() => onHover(group.range[0], scrollToIndex)}
                  class={
                    hoverIndex.value >= group.range[0] &&
                    hoverIndex.value < group.range[1]
                      ? 'selected'
                      : ''
                  }
                >
                  {group.label}
                </li>
              ))}
            </ul>
          </nav>
          <div class="menu-groups" onPointermove={onPointerMove}>
            {groupInfo.value.groups.map((group) => (
              <div key={group.key} class="menu-group">
                <h6>{group.label}</h6>
                <ul>
                  {group.items.map((item) => (
                    <li
                      key={item.key}
                      data-index={item.index}
                      class={hoverIndex.value === item.index ? 'hover' : ''}
                      onPointerenter={getOnPointerEnter(item.index)}
                      onPointerdown={() => {
                        host.value
                          ?.querySelector(`[data-index="${item.index}"]`)
                          ?.classList.add('active')
                      }}
                      onPointerup={() => {
                        host.value
                          ?.querySelector(`[data-index="${item.index}"]`)
                          ?.classList.remove('active')
                        runByIndex(item.index)
                      }}
                    >
                      <Icon icon={item.icon} />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )
    }
  },
})
