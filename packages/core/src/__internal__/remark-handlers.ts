import type { Options } from 'remark-stringify'

export const remarkHandlers: Required<Options>['handlers'] = {
  text: (node, _, state, info) => {
    // This handler removes the `&#20;` entity from a trailing space.
    const value = node.value
    // Text that ends with a space and carries no markdown character to
    // escape returns as it is, which keeps the trailing space.
    if (/^[^*_\\]*\s+$/.test(value)) {
      return value
    }
    // Other text goes through `safe`, which escapes markdown. The empty
    // `encode` list stops it from encoding a space.
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
