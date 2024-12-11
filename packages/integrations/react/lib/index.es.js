import l, { createContext as g, useContext as a, useRef as u, useEffect as E, useState as f, useMemo as y, useCallback as m, useLayoutEffect as v } from "react";
const s = g({});
function I() {
  const { dom: t, editor: o, setLoading: e, editorFactory: r } = a(s), i = u(null);
  return E(() => {
    const n = i.current;
    if (!r || !n)
      return;
    t.current = n;
    const d = r(n);
    if (d)
      return e(!0), d.create().then((c) => {
        o.current = c;
      }).finally(() => {
        e(!1);
      }).catch(console.error), () => {
        var c;
        (c = o.current) == null || c.destroy();
      };
  }, [t, o, r, e]), i;
}
const C = () => {
  const t = I();
  return /* @__PURE__ */ l.createElement("div", { "data-milkdown-root": !0, ref: t });
}, R = ({ children: t }) => {
  const o = u(void 0), [e, r] = f(void 0), i = u(), [n, d] = f(!0), c = y(() => ({
    loading: n,
    dom: o,
    editor: i,
    setLoading: d,
    editorFactory: e,
    setEditorFactory: r
  }), [n, e]);
  return /* @__PURE__ */ l.createElement(s.Provider, { value: c }, t);
};
function k(t, o = []) {
  const e = a(s), r = m(t, o);
  return v(() => {
    e.setEditorFactory(() => r);
  }, [e, r]), {
    loading: e.loading,
    get: () => e.editor.current
  };
}
function F() {
  const t = a(s), o = m(() => t.editor.current, [t.editor]);
  return [t.loading, o];
}
export {
  C as Milkdown,
  R as MilkdownProvider,
  k as useEditor,
  F as useInstance
};
//# sourceMappingURL=index.es.js.map
