/* Copyright 2021, Milkdown by Mirone. */
import { ThemeColor } from './keys'
import type { ThemeManager } from './manager'
import type { Color } from './types'

type RGB = [number, number, number]
export const hex2rgb = (hex: string): RGB | null => {
  const rgbShorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i
  const rgbRegex = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
  const parse16 = (x: string) => parseInt(x, 16)

  const fullHex = hex.slice(1).replace(rgbShorthandRegex, (_, r, g, b) => {
    return r + r + g + g + b + b
  })

  const [ok, r = '0', g = '0', b = '0'] = fullHex.match(rgbRegex) || []

  return ok ? ([r, g, b].map(parse16) as RGB) : null
}

export const getPalette
    = (manager: ThemeManager) =>
      (color: Color, opacity = 1) =>
        manager.get(ThemeColor, [color, opacity])
