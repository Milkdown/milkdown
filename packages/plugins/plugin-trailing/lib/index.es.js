import { PluginKey as f, Plugin as h } from "@milkdown/prose/state";
import { $ctx as y, $prose as C } from "@milkdown/utils";
const l = y({
  shouldAppend: (n) => !(!n || ["heading", "paragraph"].includes(n.type.name)),
  getNode: (n) => n.schema.nodes.paragraph.create()
}, "trailingConfig");
l.meta = {
  package: "@milkdown/plugin-trailing",
  displayName: "Ctx<trailingConfig>"
};
const p = C((n) => {
  const c = new f("MILKDOWN_TRAILING"), { shouldAppend: s, getNode: r } = n.get(l.key), g = new h({
    key: c,
    state: {
      init: (i, e) => {
        const t = e.tr.doc.lastChild;
        return s(t, e);
      },
      apply: (i, e, t, o) => {
        if (!i.docChanged)
          return e;
        const a = i.doc.lastChild;
        return s(a, o);
      }
    },
    appendTransaction: (i, e, t) => {
      const { doc: o, tr: a } = t, d = r == null ? void 0 : r(t), u = g.getState(t), m = o.content.size;
      if (!(!u || !d))
        return a.insert(m, d);
    }
  });
  return g;
});
p.meta = {
  package: "@milkdown/plugin-trailing",
  displayName: "Prose<trailing>"
};
const P = [l, p];
export {
  P as trailing,
  l as trailingConfig,
  p as trailingPlugin
};
//# sourceMappingURL=index.es.js.map
