/* Copyright 2021, Milkdown by Mirone. */
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'

export type $Attr = $Ctx<Record<string, any>, `${string}Attr`>

export const $attr = (name: string, defaultValue: Record<string, any> = {}) => $ctx(defaultValue, `${name}Attr`)
