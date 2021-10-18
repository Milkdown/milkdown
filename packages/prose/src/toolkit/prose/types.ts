/* Copyright 2021, Milkdown by Mirone. */
import type { Node as ProseNode } from 'prosemirror-model';

export type Predicate = (node: ProseNode) => boolean;
