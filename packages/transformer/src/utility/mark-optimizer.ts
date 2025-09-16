import type { Fragment, Mark, Node, Schema } from '@milkdown/prose/model'

/// @internal
/// Position in text with associated marks
export interface StylePosition {
  /// The position in the text sequence
  position: number
  /// Set of mark type names at this position
  marks: Set<string>
  /// The prosemirror node at this position
  node: Node
  /// Marks with their full information
  markObjects: readonly Mark[]
}

/// @internal
/// Optimal ordering for marks at a position
export interface OptimalOrdering {
  /// Position in sequence
  position: number
  /// Optimal linear ordering of mark types
  orderedMarks: string[]
  /// Cost of transitions to reach this ordering
  cost: number
}

/// @internal
/// Configuration for mark optimization
export interface MarkOptimizationConfig {
  /// Maximum sequence length to optimize (performance limit)
  maxSequenceLength?: number
}

/// @internal
/// Collects style sequence from a prosemirror fragment or fake fragment
export function collectStyleSequence(
  fragment: Fragment | { forEach: (callback: (node: Node) => void) => void }
): StylePosition[] {
  const sequence: StylePosition[] = []
  let position = 0

  fragment.forEach((node) => {
    if (node.isText) {
      sequence.push({
        position,
        marks: new Set(node.marks.map((mark) => mark.type.name)),
        node,
        markObjects: node.marks,
      })
      position++
    } else if (node.content && typeof node.content.forEach === 'function') {
      // Recursively collect from child fragments
      const childSequence = collectStyleSequence(node.content)
      sequence.push(
        ...childSequence.map((item) => ({
          ...item,
          position: position + item.position,
        }))
      )
      position += childSequence.length
    } else {
      // For non-text nodes without content, just include them with empty marks
      sequence.push({
        position,
        marks: new Set(node.marks?.map((mark) => mark.type.name) || []),
        node,
        markObjects: node.marks || [],
      })
      position++
    }
  })

  return sequence
}

/// @internal
/// Calculates optimal mark nesting using dynamic programming
export function calculateOptimalNesting(
  sequence: StylePosition[],
  config: MarkOptimizationConfig,
  schema: Schema
): OptimalOrdering[] {
  if (sequence.length === 0) {
    // Fallback to priority-based ordering
    return sequence.map((pos, index) => ({
      position: index,
      orderedMarks: Array.from(pos.marks).sort((a, b) => {
        const priorityA = schema.marks[a]?.spec.priority ?? 50
        const priorityB = schema.marks[b]?.spec.priority ?? 50
        return priorityA - priorityB
      }),
      cost: 0,
    }))
  }

  const maxLength = config.maxSequenceLength ?? 1000
  if (sequence.length > maxLength) {
    // Fallback for performance
    return sequence.map((pos, index) => ({
      position: index,
      orderedMarks: Array.from(pos.marks),
      cost: 0,
    }))
  }

  return dpOptimizeNesting(sequence, schema)
}

function dpOptimizeNesting(
  sequence: StylePosition[],
  schema: Schema
): OptimalOrdering[] {
  const n = sequence.length
  if (n === 0) return []

  const possibleOrderings: string[][][] = sequence.map((pos) => {
    const marks = Array.from(pos.marks)
    return generateAllOrderings(marks)
  })

  const dp: number[][] = Array(n)
    .fill(0)
    .map(() => Array(possibleOrderings[0]?.length ?? 0).fill(Infinity))

  const parent: Array<Array<{ pos: number; ordering: number }>> = Array(n)
    .fill(0)
    .map(() =>
      Array(possibleOrderings[0]?.length ?? 0).fill({ pos: -1, ordering: -1 })
    )

  if (possibleOrderings[0]) {
    for (let j = 0; j < possibleOrderings[0].length; j++) {
      dp[0]![j] = 0
    }
  }

  for (let i = 1; i < n; i++) {
    const currentOrderings = possibleOrderings[i]
    const prevOrderings = possibleOrderings[i - 1]

    if (!currentOrderings || !prevOrderings) continue

    for (let j = 0; j < currentOrderings.length; j++) {
      for (let k = 0; k < prevOrderings.length; k++) {
        if (dp[i - 1]![k] === Infinity) continue

        const transitionCost = calculateTransitionCost(
          prevOrderings[k]!,
          currentOrderings[j]!,
          schema
        )

        const totalCost = dp[i - 1]![k]! + transitionCost

        if (totalCost < dp[i]![j]!) {
          dp[i]![j] = totalCost
          parent[i]![j] = { pos: i - 1, ordering: k }
        }
      }
    }
  }

  let bestFinalCost = Infinity
  let bestFinalOrdering = 0

  const lastOrderings = possibleOrderings[n - 1]
  if (lastOrderings) {
    for (let j = 0; j < lastOrderings.length; j++) {
      if (dp[n - 1]![j]! < bestFinalCost) {
        bestFinalCost = dp[n - 1]![j]!
        bestFinalOrdering = j
      }
    }
  }

  // Reconstruct optimal path
  const result: OptimalOrdering[] = []
  let currentPos = n - 1
  let currentOrdering = bestFinalOrdering

  while (currentPos >= 0) {
    const orderings = possibleOrderings[currentPos]
    if (orderings) {
      result.unshift({
        position: currentPos,
        orderedMarks: orderings[currentOrdering]!,
        cost: dp[currentPos]![currentOrdering]!,
      })
    }

    if (currentPos > 0) {
      const parentInfo = parent[currentPos]![currentOrdering]!
      currentPos = parentInfo.pos
      currentOrdering = parentInfo.ordering
    } else {
      break
    }
  }

  return result
}

/// Generate all possible orderings for a set of marks
function generateAllOrderings(marks: string[]): string[][] {
  if (marks.length === 0) return [[]]
  if (marks.length === 1) return [marks]

  // For performance, limit to reasonable number of marks
  if (marks.length > 4) {
    // Fallback to single ordering for complex cases
    return [marks.sort()]
  }

  const result: string[][] = []

  function permute(arr: string[], current: string[] = []) {
    if (arr.length === 0) {
      result.push([...current])
      return
    }

    for (let i = 0; i < arr.length; i++) {
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)]
      permute(remaining, [...current, arr[i]!])
    }
  }

  permute(marks)
  return result
}

/// Calculate cost of transitioning between two mark orderings
function calculateTransitionCost(
  prevOrdering: string[],
  currentOrdering: string[],
  schema: Schema
): number {
  const prevStack = [...prevOrdering]
  const targetStack = [...currentOrdering]

  let cost = 0

  let commonPrefix = 0
  while (
    commonPrefix < Math.min(prevStack.length, targetStack.length) &&
    prevStack[commonPrefix] === targetStack[commonPrefix]
  ) {
    commonPrefix++
  }

  cost += prevStack.length - commonPrefix

  cost += targetStack.length - commonPrefix

  for (let i = 0; i < targetStack.length - 1; i++) {
    const outer = targetStack[i]!
    const inner = targetStack[i + 1]!
    const outerPriority = schema.marks[outer]?.spec.priority ?? 50
    const innerPriority = schema.marks[inner]?.spec.priority ?? 50

    if (innerPriority > outerPriority) {
      cost += (innerPriority - outerPriority) * 0.1
    }
  }

  return cost
}
