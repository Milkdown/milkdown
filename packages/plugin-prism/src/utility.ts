/* Copyright 2021, Milkdown by Mirone. */
import { findChildren } from '@milkdown/prose';

export const findBlockNodes = findChildren((child) => child.isBlock);
