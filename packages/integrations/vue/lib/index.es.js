import { inject as a, onMounted as v, onUnmounted as s, defineComponent as c, createVNode as f, ref as d, provide as m, Fragment as y } from "vue";
function g() {
  const { dom: e, loading: o, editor: n, editorFactory: r } = a(i, {});
  return v(() => {
    if (!e.value)
      return;
    const t = r.value(e.value);
    t && (o.value = !0, t.create().then((u) => {
      n.value = u;
    }).finally(() => {
      o.value = !1;
    }).catch(console.error));
  }), s(() => {
    var t;
    (t = n.value) == null || t.destroy();
  }), e;
}
const i = Symbol("editorInfoCtxKey"), k = /* @__PURE__ */ c({
  name: "Milkdown",
  setup: () => {
    const e = g();
    return () => f("div", {
      "data-milkdown-root": !0,
      ref: e
    }, null);
  }
}), w = /* @__PURE__ */ c({
  name: "MilkdownProvider",
  setup: (e, {
    slots: o
  }) => {
    const n = d(null), r = d(void 0), t = d(void 0), u = d(!0);
    return m(i, {
      loading: u,
      dom: n,
      editor: t,
      editorFactory: r
    }), () => {
      var l;
      return f(y, null, [(l = o.default) == null ? void 0 : l.call(o)]);
    };
  }
});
function M(e) {
  const { editorFactory: o, loading: n, editor: r } = a(i);
  return o.value = e, {
    loading: n,
    get: () => r.value
  };
}
function F() {
  const e = a(i);
  return [e.loading, () => e.editor.value];
}
export {
  k as Milkdown,
  w as MilkdownProvider,
  i as editorInfoCtxKey,
  M as useEditor,
  F as useInstance
};
//# sourceMappingURL=index.es.js.map
