/* Copyright 2021, Milkdown by Mirone. */
import { createSlice } from '@milkdown/ctx';
import type { Plugin } from '@milkdown/prose';

export const prosePluginsCtx = createSlice<Plugin[]>([], 'prosePlugins');
