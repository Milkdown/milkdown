/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { createSlice } from '@milkdown/ctx'
import type { Emotion } from '@emotion/css/create-instance'
import createEmotion from '@emotion/css/create-instance'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 6)

export const EmotionCtx = createSlice(null as unknown as Emotion, 'EmotionCtx')

export function configureEmotion(container: Node, ctx: Ctx) {
  const emotion = createEmotion({
    key: `crepe-${nanoid()}`,
    container,
  })
  ctx.inject(EmotionCtx, emotion)
}

export function injectStyle(style: string) {
  return (ctx: Ctx) => {
    const emotion = ctx.get(EmotionCtx)
    emotion.injectGlobal(style)
  }
}
