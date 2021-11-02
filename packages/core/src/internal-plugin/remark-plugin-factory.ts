/* Copyright 2021, Milkdown by Mirone. */
import { createSlice } from '@milkdown/ctx';

import { RemarkPlugin } from '../utility';

export const remarkPluginsCtx = createSlice<RemarkPlugin[]>([], 'remarkPlugins');
