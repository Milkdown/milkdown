import type { Mark, Node } from '@milkdown/prose/model'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'

/// @internal
export type $NodeAttr = $Ctx<
  (node: Node) => Record<string, any>,
  `${string}Attr`
>

/// Create a slice which contains the attributes for node schema.
export const $nodeAttr = (
  name: string,
  value: (node: Node) => Record<string, any> = () => ({})
): $NodeAttr => $ctx(value, `${name}Attr`)

/// @internal
export type $MarkAttr = $Ctx<
  (node: Mark) => Record<string, any>,
  `${string}Attr`
>

/// Create a slice which contains the attributes for mark schema.
export const $markAttr = (
  name: string,
  value: (mark: Mark) => Record<string, any> = () => ({})
): $MarkAttr => $ctx(value, `${name}Attr`)
