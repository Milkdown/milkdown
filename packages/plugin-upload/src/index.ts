import type { MilkdownPlugin } from '@milkdown/ctx'
import { uploadConfig, uploadPlugin } from './upload'

export * from './upload'
export * from './default-uploader'

/// All plugins exported by this package.
export const upload: MilkdownPlugin[] = [uploadConfig, uploadPlugin]
