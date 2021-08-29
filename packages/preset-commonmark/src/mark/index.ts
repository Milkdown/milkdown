/* Copyright 2021, Milkdown by Mirone. */
import { codeInline } from './code-inline';
import { em } from './em';
import { link } from './link';
import { strong } from './strong';

export const marks = [codeInline(), em(), strong(), link()];

export * from './code-inline';
export * from './em';
export * from './link';
export * from './strong';
