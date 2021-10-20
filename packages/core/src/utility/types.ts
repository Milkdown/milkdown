/* Copyright 2021, Milkdown by Mirone. */
import type { Mark, Node } from '../internal-plugin';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export type JSONRecord = Record<string, JSONValue>;

export type Atom = Mark | Node;
