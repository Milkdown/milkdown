/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import { updatePlugin, uploadConfig } from './upload'

export * from './upload'
export * from './default-uploader'

export const upload: MilkdownPlugin[] = [uploadConfig, updatePlugin]
