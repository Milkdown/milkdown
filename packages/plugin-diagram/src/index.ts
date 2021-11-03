/* Copyright 2021, Milkdown by Mirone. */

import { AtomList } from '@milkdown/utils';

import { diagramNode } from './node';

export * from './remark-mermaid';

export const diagram = AtomList.create([diagramNode()]);

export { Options, TurnIntoDiagram } from './node';
