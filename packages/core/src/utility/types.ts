/* Copyright 2021, Milkdown by Mirone. */
import type { Root } from 'mdast';
import type { remark } from 'remark';
import type { Plugin } from 'unified';

import type { Mark, Node } from '../internal-plugin';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export type JSONRecord = Record<string, JSONValue>;

export type Atom = Mark | Node;

export type RemarkPlugin = Plugin<never[], Root>;

export type RemarkParser = ReturnType<typeof remark>;
