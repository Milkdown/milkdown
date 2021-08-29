/* Copyright 2021, Milkdown by Mirone. */
import { findChildren } from '@milkdown/utils';

export const findBlockNodes = findChildren((child) => child.isBlock);
