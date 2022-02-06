/* Copyright 2021, Milkdown by Mirone. */
import { createSlice } from '@milkdown/ctx';
import { Emotion, Options } from '@milkdown/design-system';

export const emotionConfigCtx = createSlice<Options>({ key: 'milkdown' }, 'EmotionConfig');
export const emotionCtx = createSlice<Emotion>({} as Emotion, 'Emotion');
