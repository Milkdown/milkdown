/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/core'
import { diagramSchema, insertDiagramCommand, insertDiagramInputRules, remarkDiagramPlugin } from './node'

export * from './node'

export const diagram: MilkdownPlugin[] = [remarkDiagramPlugin, diagramSchema, insertDiagramCommand, insertDiagramInputRules].flat()
