import type { Options } from 'remark-stringify'

export const remarkHandlers: Required<Options>['handlers'] = {
  text: (node, parent, state, info) => {
    // A plugin can add a text node with no value, for example an emoji
    // without an image.
    const value = node.value ?? ''
    const next = info.after ?? ''
    const lineEnd = /^[\r\n]/.test(next)
    // A line end from a sibling is a soft break inside the block. Two
    // spaces before it make a hard break, so `safe` must encode them.
    if (lineEnd && parent?.children.at(-1) !== node)
      return state.safe(value, info)

    // `safe` writes a space or a tab before a line end as `&#x20;` or
    // `&#x9;`. The trailing spaces and tabs stay out of `safe` and are
    // written as they are. The rest of the text is still escaped.
    let end = value.length
    while (end > 0 && (value[end - 1] === ' ' || value[end - 1] === '\t')) end--
    const trailing = value.slice(end)
    // At the end of the block a parser drops that whitespace, so the
    // patterns check the text against the line end. This escapes the last
    // `#` of a heading such as `Issue # `, which would close the heading.
    const after = lineEnd ? next : trailing + next
    return state.safe(value.slice(0, end), { ...info, after }) + trailing
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
