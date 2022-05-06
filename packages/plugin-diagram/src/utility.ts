/* Copyright 2021, Milkdown by Mirone. */
import { Node } from '@milkdown/prose/model';
import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet('abcedfghicklmn', 10);

export const getId = (node?: Node) => node?.attrs?.['identity'] || nanoid();
