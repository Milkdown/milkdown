/* Copyright 2021, Milkdown by Mirone. */
import type { Handlers } from 'mdast-util-to-markdown'

export const remarkHandlers: Partial<Handlers> = {
  strong: (node, _, state, info) => {
    const marker = node.marker || state.options.strong || '*'
    const exit = state.enter('strong')
    const tracker = state.createTracker(info)
    let value = tracker.move(marker + marker)
    value += tracker.move(
      state.containerPhrasing(node, {
        before: value,
        after: marker,
        ...tracker.current(),
      }),
    )
    value += tracker.move(marker + marker)
    exit()
    return value
  },
  emphasis: (node, _, state, info) => {
    const marker = node.marker || state.options.emphasis || '*'
    const exit = state.enter('emphasis')
    const tracker = state.createTracker(info)
    let value = tracker.move(marker)
    value += tracker.move(
      state.containerPhrasing(node, {
        before: value,
        after: marker,
        ...tracker.current(),
      }),
    )
    value += tracker.move(marker)
    exit()
    return value
  },
}
