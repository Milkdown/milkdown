/* Copyright 2021, Milkdown by Mirone. */
import type { Mark, Node } from '@milkdown/prose/model'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'

export type $NodeAttr = $Ctx<(node: Node) => Record<string, any>, `${string}Attr`>
export const $nodeAttr = (name: string, value: (node: Node) => Record<string, any> = () => ({})): $NodeAttr => $ctx(value, `${name}Attr`)

export type $MarkAttr = $Ctx<(node: Mark) => Record<string, any>, `${string}Attr`>
export const $markAttr = (name: string, value: (mark: Mark) => Record<string, any> = () => ({})): $MarkAttr => $ctx(value, `${name}Attr`)
