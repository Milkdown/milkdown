/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager';
import { Icon, IconValue } from '../types';

export const ThemeIcon = createThemeSliceKey<IconValue, Icon, 'icon'>('icon');
