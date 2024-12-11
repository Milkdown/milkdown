var n = /* @__PURE__ */ ((e) => (e.docTypeError = "docTypeError", e.contextNotFound = "contextNotFound", e.timerNotFound = "timerNotFound", e.ctxCallOutOfScope = "ctxCallOutOfScope", e.createNodeInParserFail = "createNodeInParserFail", e.stackOverFlow = "stackOverFlow", e.parserMatchError = "parserMatchError", e.serializerMatchError = "serializerMatchError", e.getAtomFromSchemaFail = "getAtomFromSchemaFail", e.expectDomTypeError = "expectDomTypeError", e.callCommandBeforeEditorView = "callCommandBeforeEditorView", e.missingRootElement = "missingRootElement", e.missingNodeInSchema = "missingNodeInSchema", e.missingMarkInSchema = "missingMarkInSchema", e.ctxNotBind = "ctxNotBind", e.missingYjsDoc = "missingYjsDoc", e))(n || {});
class t extends Error {
  constructor(o, a) {
    super(a), this.name = "MilkdownError", this.code = o;
  }
}
const u = (e, o) => typeof o == "function" ? "[Function]" : o, i = (e) => JSON.stringify(e, u);
function l(e) {
  return new t(n.docTypeError, `Doc type error, unsupported type: ${i(e)}`);
}
function d(e) {
  return new t(n.contextNotFound, `Context "${e}" not found, do you forget to inject it?`);
}
function f(e) {
  return new t(n.timerNotFound, `Timer "${e}" not found, do you forget to record it?`);
}
function p() {
  return new t(n.ctxCallOutOfScope, "Should not call a context out of the plugin.");
}
function g(...e) {
  const o = e.reduce((a, c) => {
    if (!c)
      return a;
    const s = (r) => Array.isArray(r) ? r.map((m) => s(m)).join(", ") : r.toJSON ? i(r.toJSON()) : r.spec ? i(r.spec) : r.toString();
    return `${a}, ${s(c)}`;
  }, "Create prosemirror node from remark failed in parser");
  return new t(n.createNodeInParserFail, o);
}
function h() {
  return new t(n.stackOverFlow, "Stack over flow, cannot pop on an empty stack.");
}
function w(e) {
  return new t(n.parserMatchError, `Cannot match target parser for node: ${i(e)}.`);
}
function F(e) {
  return new t(n.serializerMatchError, `Cannot match target serializer for node: ${i(e)}.`);
}
function N(e, o) {
  return new t(n.getAtomFromSchemaFail, `Cannot get ${e}: ${o} from schema.`);
}
function S(e) {
  return new t(n.expectDomTypeError, `Expect to be a dom, but get: ${i(e)}.`);
}
function y() {
  return new t(
    n.callCommandBeforeEditorView,
    "You're trying to call a command before editor view initialized, make sure to get commandManager from ctx after editor view has been initialized"
  );
}
function k() {
  return new t(
    n.missingRootElement,
    "Missing root element, milkdown cannot find root element of the editor."
  );
}
function M(e) {
  return new t(
    n.missingNodeInSchema,
    `Missing node in schema, milkdown cannot find "${e}" in schema.`
  );
}
function x(e) {
  return new t(
    n.missingMarkInSchema,
    `Missing mark in schema, milkdown cannot find "${e}" in schema.`
  );
}
function O() {
  return new t(n.ctxNotBind, "Context not bind, please make sure the plugin has been initialized.");
}
function E() {
  return new t(n.missingYjsDoc, "Missing yjs doc, please make sure you have bind one.");
}
export {
  y as callCommandBeforeEditorView,
  d as contextNotFound,
  g as createNodeInParserFail,
  p as ctxCallOutOfScope,
  O as ctxNotBind,
  l as docTypeError,
  S as expectDomTypeError,
  N as getAtomFromSchemaFail,
  x as missingMarkInSchema,
  M as missingNodeInSchema,
  k as missingRootElement,
  E as missingYjsDoc,
  w as parserMatchError,
  F as serializerMatchError,
  h as stackOverFlow,
  f as timerNotFound
};
//# sourceMappingURL=index.es.js.map
