import { $remark as f, $ctx as N, $nodeSchema as u, $inputRule as h } from "@milkdown/utils";
import k from "katex";
import v from "remark-math";
import { Fragment as M } from "@milkdown/prose/model";
import { InputRule as g } from "@milkdown/prose/inputrules";
import { expectDomTypeError as $ } from "@milkdown/exception";
import { nodeRule as I } from "@milkdown/prose";
function o(n, e) {
  return Object.assign(n, {
    meta: {
      package: "@milkdown/plugin-math",
      ...e
    }
  }), n;
}
const s = f("remarkMath", () => v);
o(s.plugin, {
  displayName: "Remark<remarkMath>"
});
o(s.options, {
  displayName: "RemarkConfig<remarkMath>"
});
const c = "math_inline", m = N({}, "katexOptions");
o(m, {
  displayName: "Ctx<katexOptions>"
});
const l = u("math_inline", (n) => ({
  group: "inline",
  content: "text*",
  inline: !0,
  atom: !0,
  parseDOM: [
    {
      tag: `span[data-type="${c}"]`,
      getContent: (e, a) => {
        if (!(e instanceof HTMLElement))
          throw $(e);
        return M.from(a.text(e.dataset.value ?? ""));
      }
    }
  ],
  toDOM: (e) => {
    const a = e.textContent, t = document.createElement("span");
    return t.dataset.type = c, t.dataset.value = a, k.render(a, t, n.get(m.key)), t;
  },
  parseMarkdown: {
    match: (e) => e.type === "inlineMath",
    runner: (e, a, t) => {
      e.openNode(t).addText(a.value).closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === c,
    runner: (e, a) => {
      e.addNode("inlineMath", void 0, a.textContent);
    }
  }
}));
o(l.ctx, {
  displayName: "NodeSchemaCtx<mathInline>"
});
o(l.node, {
  displayName: "NodeSchema<mathInline>"
});
const y = h(
  (n) => I(/(?:\$)([^$]+)(?:\$)$/, l.type(n), {
    beforeDispatch: ({ tr: e, match: a, start: t }) => {
      e.insertText(a[1] ?? "", t + 1);
    }
  })
);
o(y, {
  displayName: "InputRule<mathInline>"
});
const p = "math_block", r = u("math_block", (n) => ({
  content: "text*",
  group: "block",
  marks: "",
  defining: !0,
  atom: !0,
  isolating: !0,
  attrs: {
    value: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: `div[data-type="${p}"]`,
      preserveWhitespace: "full",
      getAttrs: (e) => ({ value: e.dataset.value ?? "" })
    }
  ],
  toDOM: (e) => {
    const a = e.attrs.value, t = document.createElement("div");
    return t.dataset.type = p, t.dataset.value = a, k.render(a, t, n.get(m.key)), t;
  },
  parseMarkdown: {
    match: ({ type: e }) => e === "math",
    runner: (e, a, t) => {
      const i = a.value;
      e.addNode(t, { value: i });
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === p,
    runner: (e, a) => {
      e.addNode("math", void 0, a.attrs.value);
    }
  }
}));
o(r.ctx, {
  displayName: "NodeSchemaCtx<mathBlock>"
});
o(r.node, {
  displayName: "NodeSchema<mathBlock>"
});
const x = h((n) => new g(
  /^\$\$\s$/,
  (e, a, t, i) => {
    const d = e.doc.resolve(t);
    return d.node(-1).canReplaceWith(d.index(-1), d.indexAfter(-1), r.type(n)) ? e.tr.delete(t, i).setBlockType(t, t, r.type(n)) : null;
  }
));
o(x, {
  displayName: "InputRule<mathBlock>"
});
const b = [s, m, l, r, x, y].flat();
export {
  m as katexOptionsCtx,
  b as math,
  x as mathBlockInputRule,
  r as mathBlockSchema,
  y as mathInlineInputRule,
  l as mathInlineSchema,
  s as remarkMathPlugin
};
//# sourceMappingURL=index.es.js.map
