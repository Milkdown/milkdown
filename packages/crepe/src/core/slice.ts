/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { createSlice } from '@milkdown/ctx'
import type { Emotion } from '@emotion/css/create-instance'
import createEmotion from '@emotion/css/create-instance'
import { customAlphabet } from 'nanoid'
import { CrepeTheme } from '../theme'
import type { CrepeFeature } from '../feature'

export const ThemeCtx = createSlice(CrepeTheme.Classic, 'ThemeCtx')

export const FeaturesCtx = createSlice([] as CrepeFeature[], 'FeaturesCtx')

export const EmotionCtx = createSlice(null as unknown as Emotion, 'EmotionCtx')

export function configureTheme(theme: CrepeTheme) {
  return (ctx: Ctx) => {
    ctx.inject(ThemeCtx, theme)
  }
}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 6)
export function configureEmotion(container: Node) {
  return (ctx: Ctx) => {
    const emotion = createEmotion({
      key: `crepe-${nanoid()}`,
      container,
    })
    ctx.inject(EmotionCtx, emotion)
  }
}

export function injectStyle(style: string) {
  return (ctx: Ctx) => {
    const emotion = ctx.get(EmotionCtx)
    emotion.injectGlobal(style)
  }
}

export function configureFeatures(features: CrepeFeature[]) {
  return (ctx: Ctx) => {
    ctx.inject(FeaturesCtx, features)
  }
}
