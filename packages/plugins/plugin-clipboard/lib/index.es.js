import { schemaCtx as D, editorViewOptionsCtx as N, parserCtx as T, serializerCtx as O } from "@milkdown/core";
import { getNodeFromSchema as P } from "@milkdown/prose";
import { DOMParser as k, DOMSerializer as z } from "@milkdown/prose/model";
import { PluginKey as M, Plugin as A, TextSelection as B } from "@milkdown/prose/state";
import { $prose as F } from "@milkdown/utils";
function m(r) {
  if (!r)
    return !1;
  if (Array.isArray(r))
    return r.length > 1 ? !1 : m(r[0]);
  const e = r.content;
  return e ? m(e) : r.type === "text";
}
function L(r) {
  if (r.content.childCount === 1) {
    const e = r.content.firstChild;
    if ((e == null ? void 0 : e.type.name) === "text" && e.marks.length === 0)
      return e;
    if ((e == null ? void 0 : e.type.name) === "paragraph" && e.childCount === 1) {
      const o = e.firstChild;
      if ((o == null ? void 0 : o.type.name) === "text" && o.marks.length === 0)
        return o;
    }
  }
  return !1;
}
const W = F((r) => {
  const e = r.get(D);
  r.update(N, (t) => ({
    ...t,
    editable: t.editable ?? (() => !0)
  }));
  const o = new M("MILKDOWN_CLIPBOARD");
  return new A({
    key: o,
    props: {
      handlePaste: (t, l) => {
        var x, S;
        const d = r.get(T), i = (S = (x = t.props).editable) == null ? void 0 : S.call(x, t.state), { clipboardData: a } = l;
        if (!i || !a || t.state.selection.$from.node().type.spec.code)
          return !1;
        const s = a.getData("text/plain"), f = a.getData("vscode-editor-data");
        if (f) {
          const n = JSON.parse(f), y = n == null ? void 0 : n.mode;
          if (s && y) {
            const { tr: c } = t.state, C = P("code_block", e);
            return c.replaceSelectionWith(C.create({ language: y })).setSelection(
              B.near(c.doc.resolve(Math.max(0, c.selection.from - 2)))
            ).insertText(s.replace(/\r\n?/g, `
`)), t.dispatch(c), !0;
          }
        }
        const p = a.getData("text/html");
        if (p.length === 0 && s.length === 0)
          return !1;
        const b = k.fromSchema(e);
        let u;
        if (p.length === 0) {
          const n = d(s);
          if (!n || typeof n == "string")
            return !1;
          u = z.fromSchema(e).serializeFragment(n.content);
        } else {
          const n = document.createElement("template");
          n.innerHTML = p, u = n.content.cloneNode(!0), n.remove();
        }
        const h = b.parseSlice(u), g = L(h);
        return g ? (t.dispatch(t.state.tr.replaceSelectionWith(g, !0)), !0) : (t.dispatch(t.state.tr.replaceSelection(h)), !0);
      },
      clipboardTextSerializer: (t) => {
        const l = r.get(O);
        if (m(t.content.toJSON()))
          return t.content.textBetween(0, t.content.size, `

`);
        const i = e.topNodeType.createAndFill(void 0, t.content);
        return i ? l(i) : "";
      }
    }
  });
});
W.meta = {
  displayName: "Prose<clipboard>",
  package: "@milkdown/plugin-clipboard"
};
export {
  W as clipboard
};
//# sourceMappingURL=index.es.js.map
