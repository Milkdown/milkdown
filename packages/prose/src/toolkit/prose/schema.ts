import { getAtomFromSchemaFail } from '@milkdown/exception'

import type { MarkType, NodeType, Schema } from '../../model'

export function getNodeFromSchema(type: string, schema: Schema): NodeType {
  const target = schema.nodes[type]

  if (!target) throw getAtomFromSchemaFail('node', type)

  return target
}

export function getMarkFromSchema(type: string, schema: Schema): MarkType {
  const target = schema.marks[type]

  if (!target) throw getAtomFromSchemaFail('mark', type)

  return target
}
