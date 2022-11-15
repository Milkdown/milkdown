/* Copyright 2021, Milkdown by Mirone. */
import type { Emotion, Options } from '@emotion/css/create-instance'
import createEmotion from '@emotion/css/create-instance'
import { createSlice } from '@milkdown/ctx'

export type { Emotion, Options } from '@emotion/css/create-instance'

export const initEmotion = (options?: Options): Emotion => createEmotion(options)

export const emotionConfigCtx = createSlice<Options, 'EmotionConfig'>({ key: 'milkdown' }, 'EmotionConfig')
export const emotionCtx = createSlice<Emotion, 'Emotion'>({} as Emotion, 'Emotion')
