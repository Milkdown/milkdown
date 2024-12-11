import { findChildren as N } from "@milkdown/prose";
import { Plugin as P, PluginKey as v } from "@milkdown/prose/state";
import { refractor as y } from "refractor";
import { $ctx as D, $prose as $ } from "@milkdown/utils";
import { Decoration as L, DecorationSet as M } from "@milkdown/prose/view";
function w(r, s = []) {
  return r.flatMap(
    (e) => {
      var t;
      return e.type === "element" ? w(e.children, [...s, ...((t = e.properties) == null ? void 0 : t.className) || []]) : [{ text: e.value, className: s }];
    }
  );
}
function k(r, s, e) {
  const { highlight: t, listLanguages: i } = e, a = i(), c = [];
  return N((n) => n.type.name === s)(r).forEach((n) => {
    let p = n.pos + 1;
    const { language: o } = n.node.attrs;
    if (!o || !a.includes(o)) {
      console.warn("Unsupported language detected, this language has not been supported by current prism config: ", o);
      return;
    }
    const g = t(n.node.textContent, o);
    w(g.children).forEach((d) => {
      const m = p + d.text.length;
      if (d.className.length) {
        const u = L.inline(p, m, {
          class: d.className.join(" ")
        });
        c.push(u);
      }
      p = m;
    });
  }), M.create(r, c);
}
const C = D({
  configureRefractor: () => {
  }
}, "prismConfig");
C.meta = {
  package: "@milkdown/plugin-prism",
  displayName: "Ctx<prism>"
};
const x = $((r) => {
  const { configureRefractor: s } = r.get(C.key), e = "code_block";
  return new P({
    key: new v("MILKDOWN_PRISM"),
    state: {
      init: (t, { doc: i }) => {
        const a = s(y);
        return k(i, e, a ?? y);
      },
      apply: (t, i, a, c) => {
        var m, u;
        const n = c.selection.$head.parent.type.name === e, p = a.selection.$head.parent.type.name === e, o = N((l) => l.type.name === e)(a.doc), g = N((l) => l.type.name === e)(c.doc);
        return t.docChanged && (n || p || o.length !== g.length || ((m = o[0]) == null ? void 0 : m.node.attrs.language) !== ((u = g[0]) == null ? void 0 : u.node.attrs.language) || t.steps.some((l) => {
          const f = l;
          return f.from !== void 0 && f.to !== void 0 && o.some((h) => h.pos >= f.from && h.pos + h.node.nodeSize <= f.to);
        })) ? k(t.doc, e, y) : i.map(t.mapping, t.doc);
      }
    },
    props: {
      decorations(t) {
        return this.getState(t);
      }
    }
  });
});
x.meta = {
  package: "@milkdown/plugin-prism",
  displayName: "Prose<prism>"
};
const I = [x, C];
export {
  I as prism,
  C as prismConfig,
  x as prismPlugin
};
//# sourceMappingURL=index.es.js.map
