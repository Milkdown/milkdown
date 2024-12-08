import { ErrorCode } from './code'
import { MilkdownError } from './error'

const functionReplacer = (_: string, value: unknown) =>
  typeof value === 'function' ? '[Function]' : value

const stringify = (x: unknown): string => JSON.stringify(x, functionReplacer)

export function docTypeError(type: unknown) {
  return new MilkdownError(
    ErrorCode.docTypeError,
    `Doc type error, unsupported type: ${stringify(type)}`
  )
}

export function contextNotFound(name: string) {
  return new MilkdownError(
    ErrorCode.contextNotFound,
    `Context "${name}" not found, do you forget to inject it?`
  )
}

export function timerNotFound(name: string) {
  return new MilkdownError(
    ErrorCode.timerNotFound,
    `Timer "${name}" not found, do you forget to record it?`
  )
}

export function ctxCallOutOfScope() {
  return new MilkdownError(
    ErrorCode.ctxCallOutOfScope,
    'Should not call a context out of the plugin.'
  )
}

export function createNodeInParserFail(...args: unknown[]) {
  const message = args.reduce((msg, arg) => {
    if (!arg) return msg

    const serialize = (x: unknown): string => {
      if (Array.isArray(x))
        return (x as unknown[]).map((y) => serialize(y)).join(', ')

      if ((x as { toJSON: () => Record<string, unknown> }).toJSON)
        return stringify(
          (x as { toJSON: () => Record<string, unknown> }).toJSON()
        )

      if ((x as { spec: string }).spec)
        return stringify((x as { spec: string }).spec)

      return (x as { toString: () => string }).toString()
    }
    return `${msg}, ${serialize(arg)}`
  }, 'Create prosemirror node from remark failed in parser') as string

  return new MilkdownError(ErrorCode.createNodeInParserFail, message)
}

export function stackOverFlow() {
  return new MilkdownError(
    ErrorCode.stackOverFlow,
    'Stack over flow, cannot pop on an empty stack.'
  )
}

export function parserMatchError(node: unknown) {
  return new MilkdownError(
    ErrorCode.parserMatchError,
    `Cannot match target parser for node: ${stringify(node)}.`
  )
}

export function serializerMatchError(node: unknown) {
  return new MilkdownError(
    ErrorCode.serializerMatchError,
    `Cannot match target serializer for node: ${stringify(node)}.`
  )
}

export function getAtomFromSchemaFail(type: 'mark' | 'node', name: string) {
  return new MilkdownError(
    ErrorCode.getAtomFromSchemaFail,
    `Cannot get ${type}: ${name} from schema.`
  )
}

export function expectDomTypeError(node: unknown) {
  return new MilkdownError(
    ErrorCode.expectDomTypeError,
    `Expect to be a dom, but get: ${stringify(node)}.`
  )
}

export function callCommandBeforeEditorView() {
  return new MilkdownError(
    ErrorCode.callCommandBeforeEditorView,
    "You're trying to call a command before editor view initialized, make sure to get commandManager from ctx after editor view has been initialized"
  )
}

export function missingRootElement() {
  return new MilkdownError(
    ErrorCode.missingRootElement,
    'Missing root element, milkdown cannot find root element of the editor.'
  )
}

export function missingNodeInSchema(name: string) {
  return new MilkdownError(
    ErrorCode.missingNodeInSchema,
    `Missing node in schema, milkdown cannot find "${name}" in schema.`
  )
}

export function missingMarkInSchema(name: string) {
  return new MilkdownError(
    ErrorCode.missingMarkInSchema,
    `Missing mark in schema, milkdown cannot find "${name}" in schema.`
  )
}

export function ctxNotBind() {
  return new MilkdownError(
    ErrorCode.ctxNotBind,
    'Context not bind, please make sure the plugin has been initialized.'
  )
}

export function missingYjsDoc() {
  return new MilkdownError(
    ErrorCode.missingYjsDoc,
    'Missing yjs doc, please make sure you have bind one.'
  )
}
