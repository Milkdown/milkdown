export enum ErrorCode {
  docTypeError = 'docTypeError',
  contextNotFound = 'contextNotFound',
  timerNotFound = 'timerNotFound',
  ctxCallOutOfScope = 'ctxCallOutOfScope',
  createNodeInParserFail = 'createNodeInParserFail',
  stackOverFlow = 'stackOverFlow',
  parserMatchError = 'parserMatchError',
  serializerMatchError = 'serializerMatchError',
  getAtomFromSchemaFail = 'getAtomFromSchemaFail',
  expectDomTypeError = 'expectDomTypeError',
  callCommandBeforeEditorView = 'callCommandBeforeEditorView',
  missingRootElement = 'missingRootElement',
  missingNodeInSchema = 'missingNodeInSchema',
  missingMarkInSchema = 'missingMarkInSchema',

  // collab plugin
  ctxNotBind = 'ctxNotBind',
  missingYjsDoc = 'missingYjsDoc',
}
