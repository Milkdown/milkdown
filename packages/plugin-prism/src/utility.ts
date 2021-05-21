import { findChildren } from '@milkdown/utils';

export const findBlockNodes = findChildren((child) => child.isBlock);
