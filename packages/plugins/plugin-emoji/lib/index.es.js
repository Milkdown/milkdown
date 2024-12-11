import { expectDomTypeError as M } from "@milkdown/exception";
import { InputRule as v } from "@milkdown/prose/inputrules";
import { $nodeAttr as R, $nodeSchema as x, $remark as y, $inputRule as T } from "@milkdown/utils";
import { get as P } from "node-emoji";
import A from "remark-emoji";
import I from "twemoji";
import L from "emoji-regex";
const b = (r) => ({ title: r });
function w(r, e) {
  return I.parse(r, { attributes: b, base: "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/", ...e });
}
const k = L(), C = (r) => !!r.children, H = (r) => !!r.value;
function S(r, e) {
  return m(r, 0, null)[0];
  function m(t, n, i) {
    if (C(t)) {
      const a = [];
      for (let o = 0, c = t.children.length; o < c; o++) {
        const l = t.children[o];
        if (l) {
          const f = m(l, o, t);
          if (f)
            for (let h = 0, N = f.length; h < N; h++) {
              const d = f[h];
              d && a.push(d);
            }
        }
      }
      t.children = a;
    }
    return e(t, n, i);
  }
}
const $ = (r) => {
  function e(m) {
    S(m, (t) => {
      if (!H(t))
        return [t];
      if (t.type === "code")
        return [t];
      const n = t.value, i = [];
      let a, o = n;
      for (; a = k.exec(o); ) {
        const { index: c } = a, l = a[0];
        l && (c > 0 && i.push({ ...t, value: o.slice(0, c) }), i.push({ ...t, value: w(l, r), type: "emoji" }), o = o.slice(c + l.length)), k.lastIndex = 0;
      }
      return o.length && i.push({ ...t, value: o }), i;
    });
  }
  return e;
};
function s(r, e) {
  return Object.assign(r, {
    meta: {
      package: "@milkdown/plugin-emoji",
      ...e
    }
  }), r;
}
const j = R("emoji", () => ({
  span: {},
  img: {}
}));
s(j, {
  displayName: "Attr<emoji>"
});
const u = x("emoji", (r) => ({
  group: "inline",
  inline: !0,
  attrs: {
    html: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: 'span[data-type="emoji"]',
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw M(e);
        return { html: e.innerHTML };
      }
    }
  ],
  toDOM: (e) => {
    var i;
    const m = r.get(j.key)(e), t = document.createElement("span");
    t.innerHTML = e.attrs.html;
    const n = (i = t.firstElementChild) == null ? void 0 : i.cloneNode();
    return t.remove(), n && n instanceof HTMLElement && Object.entries(m.img).forEach(([a, o]) => n.setAttribute(a, o)), ["span", { ...m.container, "data-type": "emoji" }, n];
  },
  parseMarkdown: {
    match: ({ type: e }) => e === "emoji",
    runner: (e, m, t) => {
      e.addNode(t, { html: m.value });
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "emoji",
    runner: (e, m) => {
      const t = document.createElement("span");
      t.innerHTML = m.attrs.html;
      const n = t.querySelector("img"), i = (n == null ? void 0 : n.title) || (n == null ? void 0 : n.alt);
      t.remove(), e.addNode("text", void 0, i);
    }
  }
}));
s(u.node, {
  displayName: "NodeSchema<emoji>"
});
s(u.ctx, {
  displayName: "NodeSchemaCtx<emoji>"
});
const g = y("remarkEmoji", () => A);
s(g.plugin, {
  displayName: "Remark<remarkEmojiPlugin>"
});
s(g.options, {
  displayName: "RemarkConfig<remarkEmojiPlugin>"
});
const p = y("remarkTwemoji", () => $);
s(p.plugin, {
  displayName: "Remark<remarkTwemojiPlugin>"
});
s(p.options, {
  displayName: "RemarkConfig<remarkTwemojiPlugin>"
});
const E = T((r) => new v(/(:([^:\s]+):)$/, (e, m, t, n) => {
  const i = m[0];
  if (!i)
    return null;
  const a = P(i);
  if (!a || i.includes(a))
    return null;
  const o = w(a, r.get(p.options.key));
  return e.tr.setMeta("emoji", !0).replaceRangeWith(t, n, u.type(r).create({ html: o })).scrollIntoView();
}));
s(E, {
  displayName: "InputRule<insertEmojiInputRule>"
});
const F = [
  j,
  g,
  p,
  u,
  E
].flat();
export {
  F as emoji,
  j as emojiAttr,
  u as emojiSchema,
  E as insertEmojiInputRule,
  g as remarkEmojiPlugin,
  p as remarkTwemojiPlugin
};
//# sourceMappingURL=index.es.js.map
