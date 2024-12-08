import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  diagramSchema,
  insertDiagramCommand,
  insertDiagramInputRules,
  mermaidConfigCtx,
  remarkDiagramPlugin,
} from './node'

export * from './node'

/// All plugins exported by this package.
export const diagram: MilkdownPlugin[] = [
  remarkDiagramPlugin,
  mermaidConfigCtx,
  diagramSchema,
  insertDiagramCommand,
  insertDiagramInputRules,
].flat()
