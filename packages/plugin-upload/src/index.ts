/* Copyright 2021, Milkdown by Mirone. */
import { AtomList } from '@milkdown/utils';

import { uploadPlugin } from './upload';

export type { Uploader } from './upload';
export { key, uploadPlugin } from './upload';

export const upload = AtomList.create([uploadPlugin()]);
