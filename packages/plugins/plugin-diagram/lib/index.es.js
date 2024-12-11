import { expectDomTypeError as f } from "@milkdown/exception";
import { setBlockType as y } from "@milkdown/prose/commands";
import { InputRule as v } from "@milkdown/prose/inputrules";
import { $ctx as k, $nodeSchema as h, $inputRule as C, $remark as N, $command as x } from "@milkdown/utils";
import D from "mermaid";
import { visit as M } from "unist-util-visit";
import { customAlphabet as R } from "nanoid";
function $(t) {
  return {
    type: "diagram",
    value: t
  };
}
function w(t) {
  return M(t, "code", (e, i, a) => {
    const { lang: r, value: s } = e;
    if (r !== "mermaid")
      return e;
    const m = $(s);
    return a && i != null && a.children.splice(i, 1, m), e;
  });
}
function I() {
  function t(e) {
    w(e);
  }
  return t;
}
const T = R("abcdefg", 8), c = (t) => {
  var e;
  return ((e = t == null ? void 0 : t.attrs) == null ? void 0 : e.identity) || T();
};
function n(t, e) {
  return Object.assign(t, {
    meta: {
      package: "@milkdown/plugin-diagram",
      ...e
    }
  }), t;
}
const l = k({ startOnLoad: !1 }, "mermaidConfig");
n(l, {
  displayName: "Ctx<mermaidConfig>"
});
const o = "diagram", d = h(o, (t) => (D.initialize({
  ...t.get(l.key)
}), {
  content: "text*",
  group: "block",
  marks: "",
  defining: !0,
  atom: !0,
  isolating: !0,
  attrs: {
    value: {
      default: ""
    },
    identity: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: `div[data-type="${o}"]`,
      preserveWhitespace: "full",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw f(e);
        return {
          value: e.dataset.value,
          identity: e.dataset.id
        };
      }
    }
  ],
  toDOM: (e) => {
    const i = c(e), a = e.attrs.value, r = document.createElement("div");
    return r.dataset.type = o, r.dataset.id = i, r.dataset.value = a, r.textContent = a, r;
  },
  parseMarkdown: {
    match: ({ type: e }) => e === o,
    runner: (e, i, a) => {
      const r = i.value;
      e.addNode(a, { value: r, identity: c() });
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === o,
    runner: (e, i) => {
      e.addNode("code", void 0, i.attrs.value || "", { lang: "mermaid" });
    }
  }
}));
n(d.node, {
  displayName: "NodeSchema<diagram>"
});
n(d.ctx, {
  displayName: "NodeSchemaCtx<diagram>"
});
const p = C((t) => new v(/^```mermaid$/, (e, i, a, r) => {
  const s = d.type(t), m = e.doc.resolve(a);
  return m.node(-1).canReplaceWith(m.index(-1), m.indexAfter(-1), s) ? e.tr.delete(a, r).setBlockType(a, a, s, { identity: c() }) : null;
}));
n(p, {
  displayName: "InputRule<insertDiagramInputRules>"
});
const u = N("remarkMermaid", () => I);
n(u.plugin, {
  displayName: "Remark<diagram>"
});
n(u.options, {
  displayName: "RemarkConfig<diagram>"
});
const g = x("InsertDiagramCommand", (t) => () => y(d.type(t), { identity: c() }));
n(g, {
  displayName: "Command<insertDiagramCommand>"
});
const W = [u, l, d, g, p].flat();
export {
  W as diagram,
  d as diagramSchema,
  g as insertDiagramCommand,
  p as insertDiagramInputRules,
  l as mermaidConfigCtx,
  u as remarkDiagramPlugin
};
//# sourceMappingURL=index.es.js.map
