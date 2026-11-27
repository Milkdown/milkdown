import type { Options } from 'remark-stringify'

export const remarkHandlers: Required<Options>['handlers'] = {
  text: (node, _, state, info) => {
    // Keep trailing whitespace raw so `safe` does not write `&#x20;`.
    // Escape the preceding text with that whitespace in `info.after`.
    const value = node.value
    const match = /^([\s\S]*?)(\s+)$/.exec(value)
    if (match) {
      const [, head = '', trailing = ''] = match
      const escaped = head
        ? state.safe(head, {
            ...info,
            after: trailing + info.after,
            encode: [],
          })
        : ''
      return escaped + trailing
    }
    return state.safe(value, { ...info, encode: [] })
  },
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
      })
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
      })
    )
    value += tracker.move(marker)
    exit()
    return value
  },
}
