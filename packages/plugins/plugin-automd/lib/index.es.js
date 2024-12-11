import { $ctx as $, pipe as b, $prose as O } from "@milkdown/utils";
import { serializerCtx as R, parserCtx as I, editorViewCtx as P } from "@milkdown/core";
import { TextSelection as _, PluginKey as L, Plugin as E } from "@milkdown/prose/state";
function A(e, t) {
  return Object.assign(e, {
    meta: {
      package: "@milkdown/plugin-automd",
      ...t
    }
  }), e;
}
const F = /\[([^\]]+)]\([^\s\]]+\)/, k = /\[(?<span>((www|https:\/\/|http:\/\/)[^\s\]]+))]\((?<url>[^\s\]]+)\)/;
function H(e) {
  return new RegExp(`\\\\(?=[^\\w\\s${e}\\\\]|_)`, "g");
}
const y = "​", x = `${y}*`, N = `${y}＊`, C = `${y}_`, S = `${y}⎽`;
function W(e) {
  let t = e, o = t.match(k);
  for (; o && o.groups; ) {
    const { span: n } = o.groups;
    t = t.replace(k, n), o = t.match(k);
  }
  return t;
}
function j(e) {
  return e.replaceAll(/\\\\\*/g, x).replaceAll(/\\\\_/g, C).replaceAll(x, N).replaceAll(C, S);
}
function q(e, t, o) {
  const n = e.split(""), l = n[t];
  return n[t] && n[o] && (n[t] = n[o], n[o] = l), n.join("").toString();
}
function z(e) {
  return (t) => t.replace(H(e), "");
}
function K(e) {
  return (t) => {
    const o = t.indexOf(e.hole), n = t.charAt(o - 1), l = t.charAt(o + 1), s = /[^\w]|_/;
    return l ? n && s.test(n) && s.test(l) ? e.punctuation : e.char : e.punctuation;
  };
}
function D(e, t, o) {
  let n = t, l = !1;
  return e.descendants((s) => {
    var a;
    if (l)
      return !1;
    if (!s.textContent.includes(o))
      return n += s.nodeSize, !1;
    if (s.isText) {
      const r = (a = s.text) == null ? void 0 : a.indexOf(o);
      if (r != null && r >= 0)
        return l = !0, n += r, !1;
    }
    return n += 1, !0;
  }), n;
}
const G = {
  placeholderConfig: {
    hole: "∅",
    punctuation: "⁂",
    char: "∴"
  },
  globalNodes: ["footnote_definition"],
  shouldSyncNode: ({ prevNode: e, nextNode: t }) => e.inlineContent && t && e.type === t.type && !e.eq(t),
  movePlaceholder: (e, t) => {
    const o = ["*", "_"];
    let n = t.indexOf(e);
    for (; o.includes(t[n - 1] || "") && o.includes(t[n + 1] || ""); )
      t = q(t, n, n + 1), n = n + 1;
    return t;
  }
}, g = $(G, "inlineSyncConfig");
A(g, {
  displayName: "Ctx<inlineSyncConfig>",
  group: "Prose"
});
function B(e) {
  return e.selection.$from.node();
}
function U(e, t, o, n) {
  const l = e.get(R), s = t.schema.topNodeType.create(void 0, [o, ...n]);
  return l(s);
}
function V(e, t) {
  const o = e.get(g.key), n = o.placeholderConfig.hole, [l = "", ...s] = t.split(`

`), a = (u) => o.movePlaceholder(n, u);
  let c = b(z(n), a, W, j)(l);
  const i = K(o.placeholderConfig)(c);
  return c = c.replace(n, i), c = [c, ...s].join(`

`), [c, i];
}
function Y(e, t) {
  const n = e.get(I)(t);
  return n ? n.firstChild : null;
}
function Z(e, t) {
  const { globalNodes: o } = e.get(g.key), n = [];
  return t.doc.descendants((l) => {
    if (o.includes(l.type.name) || o.includes(l.type))
      return n.push(l), !1;
  }), n;
}
const J = (e) => e.split(`

`)[0] || "";
function Q(e) {
  return e.childCount === 1 && e.child(0).type.name === "html";
}
function M(e, t) {
  try {
    const o = Z(e, t), n = B(t), l = U(e, t, n, o), [s, a] = V(e, l), r = Y(e, s);
    return !r || n.type !== r.type || Q(r) ? null : (r.attrs = { ...n.attrs }, r.descendants((c) => {
      var p, d, h;
      const u = c.marks.find((f) => f.type.name === "link");
      u && ((p = c.text) != null && p.includes(a)) && u.attrs.href.includes(a) && (u.attrs.href = u.attrs.href.replace(a, "")), ((d = c.text) != null && d.includes(N) || (h = c.text) != null && h.includes(S)) && (c.text = c.text.replaceAll(N, x).replaceAll(S, C));
    }), {
      text: J(s),
      prevNode: n,
      nextNode: r,
      placeholder: a
    });
  } catch {
    return null;
  }
}
function X(e, t, o, n, l) {
  var m;
  const { placeholderConfig: s } = e.get(g.key), a = s.hole;
  let r = o.tr.setMeta(t, !0).insertText(a, o.selection.from);
  const c = o.apply(r), i = M(e, c);
  if (!i)
    return;
  const u = i.text.slice(0, i.text.indexOf(i.placeholder)), { $from: p } = c.selection, d = p.before(), h = p.after(), f = D(i.nextNode, d, i.placeholder);
  r = r.replaceWith(d, h, i.nextNode).setNodeMarkup(d, void 0, l).delete(f + 1, f + 2), r = r.setSelection(_.near(r.doc.resolve(f + 1))), (F.test(u) || ["*", "_", "~"].includes(u.at(-1) || "")) && r.selection instanceof _ && (((m = r.selection.$cursor) == null ? void 0 : m.marks()) ?? []).forEach((T) => {
    r = r.removeStoredMark(T.type);
  }), n(r);
}
const v = O((e) => {
  let t = null;
  const o = new L("MILKDOWN_INLINE_SYNC");
  return new E({
    key: o,
    state: {
      init: () => null,
      apply: (n, l, s, a) => {
        var f;
        const r = e.get(P);
        if (!((f = r.hasFocus) != null && f.call(r)) || !r.editable || !n.docChanged || n.getMeta(o))
          return null;
        const i = M(e, a);
        if (!i)
          return null;
        t && (cancelAnimationFrame(t), t = null);
        const { prevNode: u, nextNode: p, text: d } = i, { shouldSyncNode: h } = e.get(g.key);
        return h({ prevNode: u, nextNode: p, ctx: e, tr: n, text: d }) && (t = requestAnimationFrame(() => {
          t = null;
          const { dispatch: w, state: m } = e.get(P);
          X(e, o, m, w, u.attrs);
        })), null;
      }
    }
  });
});
A(v, {
  displayName: "Prose<inlineSyncPlugin>",
  group: "Prose"
});
const re = [
  g,
  v
];
export {
  re as automd,
  G as defaultConfig,
  g as inlineSyncConfig,
  v as inlineSyncPlugin
};
//# sourceMappingURL=index.es.js.map
