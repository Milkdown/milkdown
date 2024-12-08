import { stackOverFlow } from '@milkdown/exception'

/// The element of the stack, which holds an array of nodes.
export abstract class StackElement<Node> {
  /// A method that can `push` a node into the element.
  abstract push(node: Node, ...rest: Node[]): void
}

/// The stack that is used to store the elements.
///
/// > Generally, you don't need to use this class directly.
///
/// When using the stack, users can call `stack.open` to push a new element into the stack.
/// And use `stack.push` to push a node into the top element.
/// Then use `stack.close` to close the top element and pop it.
///
/// For example: `stack.open(A).push(B).push(C).close()` will generate a structure like `A(B, C)`.
export class Stack<Node, Element extends StackElement<Node>> {
  protected elements: Element[] = []

  /// Get the size of the stack.
  size = (): number => {
    return this.elements.length
  }

  /// Get the top element of the stack.
  top = (): Element | undefined => {
    return this.elements.at(-1)
  }

  /// Push a node into the top element.
  push = (node: Node): void => {
    this.top()?.push(node)
  }

  /// Push a new element.
  open = (node: Element): void => {
    this.elements.push(node)
  }

  /// Close the top element and pop it.
  close = (): Element => {
    const el = this.elements.pop()
    if (!el) throw stackOverFlow()

    return el
  }
}
