/* Copyright 2021, Milkdown by Mirone. */
import { ErrorCode } from './code'
import { MilkdownError } from './error'

const functionReplacer = (_: string, value: unknown) => (typeof value === 'function' ? '[Function]' : value)

const stringify = (x: unknown): string => JSON.stringify(x, functionReplacer)

export const docTypeError = (type: unknown) =>
  new MilkdownError(ErrorCode.docTypeError, `Doc type error, unsupported type: ${stringify(type)}`)

export const contextNotFound = (name: string) =>
  new MilkdownError(ErrorCode.contextNotFound, `Context "${name}" not found, do you forget to inject it?`)

export const timerNotFound = (name: string) =>
  new MilkdownError(ErrorCode.timerNotFound, `Timer "${name}" not found, do you forget to record it?`)

export const ctxCallOutOfScope = () =>
  new MilkdownError(ErrorCode.ctxCallOutOfScope, 'Should not call a context out of the plugin.')

export const createNodeInParserFail = (...args: unknown[]) => {
  const message = args.reduce((msg, arg) => {
    if (!arg)
      return msg

    const serialize = (x: unknown): string => {
      if (Array.isArray(x))
        return (x as unknown[]).map(y => serialize(y)).join(', ')

      if ((x as { toJSON(): Record<string, unknown> }).toJSON)
        return stringify((x as { toJSON(): Record<string, unknown> }).toJSON())

      if ((x as { spec: string }).spec)
        return stringify((x as { spec: string }).spec)

      return (x as { toString(): string }).toString()
    }
    return `${msg}, ${serialize(arg)}`
  }, 'Create prosemirror node from remark failed in parser') as string

  return new MilkdownError(ErrorCode.createNodeInParserFail, message)
}

export const stackOverFlow = () =>
  new MilkdownError(ErrorCode.stackOverFlow, 'Stack over flow, cannot pop on an empty stack.')

export const parserMatchError = (node: unknown) =>
  new MilkdownError(ErrorCode.parserMatchError, `Cannot match target parser for node: ${stringify(node)}.`)

export const serializerMatchError = (node: unknown) =>
  new MilkdownError(ErrorCode.serializerMatchError, `Cannot match target serializer for node: ${stringify(node)}.`)

export const getAtomFromSchemaFail = (type: 'mark' | 'node', name: string) =>
  new MilkdownError(ErrorCode.getAtomFromSchemaFail, `Cannot get ${type}: ${name} from schema.`)

export const expectDomTypeError = (node: unknown) =>
  new MilkdownError(ErrorCode.expectDomTypeError, `Expect to be a dom, but get: ${stringify(node)}.`)

export const callCommandBeforeEditorView = () =>
  new MilkdownError(
    ErrorCode.callCommandBeforeEditorView,
    'You\'re trying to call a command before editor view initialized, make sure to get commandManager from ctx after editor view has been initialized',
  )

export const themeMustInstalled = () =>
  new MilkdownError(
    ErrorCode.themeMustInstalled,
        `It seems that no theme found in editor, please make sure you have use theme in front of all plugins.
If you prefer to use an empty theme, you can use \`themeFactory({})\`.`,
  )

export const missingRootElement = () =>
  new MilkdownError(
    ErrorCode.missingRootElement,
    'Missing root element, milkdown cannot find root element of the editor.',
  )

export const missingNodeInSchema = (name: string) =>
  new MilkdownError(
    ErrorCode.missingNodeInSchema,
        `Missing node in schema, milkdown cannot find "${name}" in schema.`,
  )

export const missingMarkInSchema = (name: string) =>
  new MilkdownError(
    ErrorCode.missingMarkInSchema,
        `Missing mark in schema, milkdown cannot find "${name}" in schema.`,
  )

export const missingIcon = (name: string) =>
  new MilkdownError(ErrorCode.missingIcon, `Missing icon in theme, milkdown cannot find icon "${name}" in theme.`)

export const ctxNotBind = () =>
  new MilkdownError(ErrorCode.ctxNotBind, 'Context not bind, please make sure the plugin has been initialized.')

export const missingYjsDoc = () =>
  new MilkdownError(ErrorCode.missingYjsDoc, 'Missing yjs doc, please make sure you have bind one.')

export const vueRendererCallOutOfScope = () =>
  new MilkdownError(ErrorCode.vueRendererCallOutOfScope, 'Should not call vue renderer before it has been created.')

export const missingMenuWrapper = () =>
  new MilkdownError(ErrorCode.missingMenuWrapper, 'Missing menu wrapper, should init menu wrapper first.')

export const repeatCallsToMenuWrapperInit = () =>
  new MilkdownError(ErrorCode.repeatCallsToMenuWrapperInit, 'Repeated calls to menu wrapper initialization')
