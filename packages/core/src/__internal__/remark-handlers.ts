import type { Options } from 'remark-stringify'

export const remarkHandlers: Required<Options>['handlers'] = {
  text: (node, _, state, info) => {
    // This handler removes the `&#20;` entity from a trailing space.
    const value = node.value
    // `safe` encodes a space at the start or end of a line as `&#x20;`.
    // Text that ends with a space and has no `*`, `_` or `\` keeps its
    // outer spaces out of `safe`. The text between them still goes through
    // `safe`, which escapes markdown characters such as `#` and `|`.
    if (/^[^*_\\]*\s+$/.test(value)) {
      const body = value.trim()
      const lead = value.slice(0, value.length - value.trimStart().length)
      const trail = value.slice(lead.length + body.length)
      const escaped = state.safe(body, {
        ...info,
        before: info.before + lead,
        after: trail + info.after,
        encode: [],
      })
      return lead + escaped + trail
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
