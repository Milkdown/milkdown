/* Copyright 2021, Milkdown by Mirone. */
import type { MarkSpec, NodeSpec } from '@milkdown/prose/model'
import type { Root } from 'mdast'
import type { remark } from 'remark'
import type { Plugin } from 'unified'
import type { Node } from 'unist'
import type { MarkParserSpec, NodeParserSpec } from '../parser/types'
import type { MarkSerializerSpec, NodeSerializerSpec } from '../serializer/types'

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }

export type JSONRecord = Record<string, JSONValue>

export type RemarkPlugin = Plugin<never[], Root>

export type RemarkParser = ReturnType<typeof remark>

export type MarkdownNode = Node & { children?: MarkdownNode[]; [x: string]: unknown }

export type NodeSchema = {
  readonly toMarkdown: NodeSerializerSpec
  readonly parseMarkdown: NodeParserSpec
  readonly priority?: number
} & Readonly<NodeSpec>

export type MarkSchema = {
  readonly toMarkdown: MarkSerializerSpec
  readonly parseMarkdown: MarkParserSpec
} & Readonly<MarkSpec>
