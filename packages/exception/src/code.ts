/* Copyright 2021, Milkdown by Mirone. */
export const enum ErrorCode {
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
    themeMustInstalled = 'themeMustInstalled',
    missingRootElement = 'missingRootElement',
    missingNodeInSchema = 'missingNodeInSchema',
    missingMarkInSchema = 'missingMarkInSchema',

    // theme
    missingIcon = 'missingIcon',

    // collab plugin
    ctxNotBind = 'ctxNotBind',
    missingYjsDoc = 'missingYjsDoc',

    // vue
    vueRendererCallOutOfScope = 'vueRendererCallOutOfScope',
}
