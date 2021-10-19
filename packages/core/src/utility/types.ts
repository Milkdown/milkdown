/* Copyright 2021, Milkdown by Mirone. */
import type { Mark, Node } from '../internal-plugin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type Atom = Mark | Node;
