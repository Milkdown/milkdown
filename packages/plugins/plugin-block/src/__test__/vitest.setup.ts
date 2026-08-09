// Mock missing DOM APIs that ProseMirror needs but JSDOM doesn't provide

// Mock elementFromPoint
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null
}

// Mock getClientRects for all elements
Object.defineProperty(Element.prototype, 'getClientRects', {
  value: function () {
    return {
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    }
  },
})

Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: function () {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    }
  },
})

// Mock Range methods
Object.defineProperty(Range.prototype, 'getClientRects', {
  value: function () {
    return {
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    }
  },
})

Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
  value: function () {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    }
  },
})

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: function () {},
})
