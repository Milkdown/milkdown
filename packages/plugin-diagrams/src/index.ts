/* Copyright 2021, Milkdown by Mirone. */

import { AtomList } from '@milkdown/utils';

import { diagramNode } from './node';
import { remarkPlugin } from './remark-mermaid';

export * from './remark-mermaid';

export const diagrams = AtomList.create([remarkPlugin, diagramNode()]);
