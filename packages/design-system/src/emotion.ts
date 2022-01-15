/* Copyright 2021, Milkdown by Mirone. */
import createEmotion, { Emotion, Options } from '@emotion/css/create-instance';

export type { Emotion, Options } from '@emotion/css/create-instance';

export const init = (options?: Options): Emotion => createEmotion(options);
