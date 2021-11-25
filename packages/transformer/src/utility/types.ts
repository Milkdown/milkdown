/* Copyright 2021, Milkdown by Mirone. */
import type { Root } from 'mdast';
import type { remark } from 'remark';
import type { Plugin } from 'unified';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export type JSONRecord = Record<string, JSONValue>;

export type RemarkPlugin = Plugin<never[], Root>;

export type RemarkParser = ReturnType<typeof remark>;
