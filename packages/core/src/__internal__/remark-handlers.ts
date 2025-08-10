import type { Options } from 'remark-stringify'

export const remarkHandlers: Required<Options>['handlers'] = {
  text: (node, _, state, info) => {
    // This config is to remove the `&#20;` entity when have trailing spaces
    const value = node.value
    // Check if the text contains only trailing spaces that might be encoded
    if (/^[^*_\\]*\s+$/.test(value)) {
      // For text that ends with spaces but has no markdown special characters that need escaping,
      // return the value directly to preserve trailing spaces
      return value
    }
    // For other text, use safe to handle markdown escaping but prevent space encoding
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
