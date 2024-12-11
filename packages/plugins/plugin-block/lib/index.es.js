var Q = (s) => {
  throw TypeError(s);
};
var j = (s, t, e) => t.has(s) || Q("Cannot " + e);
var i = (s, t, e) => (j(s, t, "read from private field"), e ? e.call(s) : t.get(s)), a = (s, t, e) => t.has(s) ? Q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(s) : t.set(s, e), n = (s, t, e, r) => (j(s, t, "write to private field"), r ? r.call(s, e) : t.set(s, e), e), Z = (s, t, e) => (j(s, t, "access private method"), e);
import { $ctx as J, $prose as lt } from "@milkdown/utils";
import { findParent as at, browser as I } from "@milkdown/prose";
import { NodeSelection as tt, PluginKey as ct, Plugin as ht } from "@milkdown/prose/state";
import { editorViewCtx as q } from "@milkdown/core";
import dt from "lodash.throttle";
import { DOMSerializer as ut } from "@milkdown/prose/model";
import { flip as ft, offset as pt, computePosition as gt } from "@floating-ui/dom";
function W(s, t) {
  return Object.assign(s, {
    meta: {
      package: "@milkdown/plugin-block",
      ...t
    }
  }), s;
}
const mt = (s) => !at((e) => e.type.name === "table")(s), _ = J({ filterNodes: mt }, "blockConfig");
W(_, {
  displayName: "Ctx<blockConfig>"
});
function bt(s, t, e) {
  var o;
  if (!s.dom.parentElement)
    return null;
  try {
    const l = (o = s.posAtCoords({
      left: t.x,
      top: t.y
    })) == null ? void 0 : o.inside;
    if (l == null || l < 0)
      return null;
    let c = s.state.doc.resolve(l), h = s.state.doc.nodeAt(l), d = s.nodeDOM(l);
    const u = (z) => {
      const Y = c.depth >= 1 && c.index(c.depth) === 0;
      if (!(z || Y))
        return;
      const S = c.before(c.depth);
      h = s.state.doc.nodeAt(S), d = s.nodeDOM(S), c = s.state.doc.resolve(S), e(c, h) || u(!0);
    }, R = e(c, h);
    return u(!R), !d || !h ? null : { node: h, $pos: c, el: d };
  } catch {
    return null;
  }
}
let et = null;
function kt() {
  return et || (et = document.implementation.createHTMLDocument("title"));
}
const Ct = {
  thead: ["table"],
  tbody: ["table"],
  tfoot: ["table"],
  caption: ["table"],
  colgroup: ["table"],
  col: ["table", "colgroup"],
  tr: ["table", "tbody"],
  td: ["table", "tbody", "tr"],
  th: ["table", "tbody", "tr"]
};
function yt(s, t) {
  const e = [];
  let { openStart: r, openEnd: o, content: l } = t;
  for (; r > 1 && o > 1 && l.childCount === 1 && l.firstChild.childCount === 1; ) {
    r -= 1, o -= 1;
    const p = l.firstChild;
    e.push(
      p.type.name,
      p.attrs !== p.type.defaultAttrs ? p.attrs : null
    ), l = p.content;
  }
  const c = s.someProp("clipboardSerializer") || ut.fromSchema(s.state.schema), h = kt(), d = h.createElement("div");
  d.appendChild(c.serializeFragment(l, { document: h }));
  let u = d.firstChild, R, z = 0;
  for (; u && u.nodeType === 1 && (R = Ct[u.nodeName.toLowerCase()]); ) {
    for (let p = R.length - 1; p >= 0; p--) {
      const S = h.createElement(R[p]);
      for (; d.firstChild; ) S.appendChild(d.firstChild);
      d.appendChild(S), z++;
    }
    u = d.firstChild;
  }
  u && u.nodeType === 1 && u.setAttribute(
    "data-pm-slice",
    `${r} ${o}${z ? ` -${z}` : ""} ${JSON.stringify(e)}`
  );
  const Y = s.someProp("clipboardTextSerializer", (p) => p(t, s)) || t.content.textBetween(0, t.content.size, `

`);
  return { dom: d, text: Y };
}
const it = I.ie && I.ie_version < 15 || I.ios && I.webkit_version < 604, ot = 20;
var D, H, C, g, T, m, k, st, A, y, v, F, M, P, B, K, w;
class vt {
  constructor() {
    a(this, k);
    /// @internal
    a(this, D);
    a(this, H);
    a(this, C);
    a(this, g);
    a(this, T);
    a(this, m);
    /// @internal
    a(this, y);
    a(this, v);
    a(this, F);
    a(this, M);
    a(this, P);
    a(this, B);
    a(this, K);
    a(this, w);
    n(this, H, () => {
      if (!i(this, g))
        return null;
      const t = i(this, g), e = i(this, k, A);
      if (e && tt.isSelectable(t.node)) {
        const r = tt.create(e.state.doc, t.$pos.pos);
        return e.dispatch(e.state.tr.setSelection(r)), e.focus(), n(this, C, r), r;
      }
      return null;
    }), n(this, C, null), n(this, g, null), n(this, T, void 0), n(this, m, !1), n(this, v, () => {
      var t;
      (t = i(this, y)) == null || t.call(this, { type: "hide" }), n(this, g, null);
    }), n(this, F, (t) => {
      var e;
      n(this, g, t), (e = i(this, y)) == null || e.call(this, { type: "show", active: t });
    }), this.bind = (t, e) => {
      n(this, D, t), n(this, y, e);
    }, this.addEvent = (t) => {
      t.addEventListener("mousedown", i(this, M)), t.addEventListener("mouseup", i(this, P)), t.addEventListener("dragstart", i(this, B));
    }, this.removeEvent = (t) => {
      t.removeEventListener("mousedown", i(this, M)), t.removeEventListener("mouseup", i(this, P)), t.removeEventListener("dragstart", i(this, B));
    }, this.unBind = () => {
      n(this, y, void 0);
    }, n(this, M, () => {
      var t;
      n(this, T, (t = i(this, g)) == null ? void 0 : t.el.getBoundingClientRect()), i(this, H).call(this);
    }), n(this, P, () => {
      if (!i(this, m)) {
        requestAnimationFrame(() => {
          var t;
          i(this, T) && ((t = i(this, k, A)) == null || t.focus());
        });
        return;
      }
      n(this, m, !1), n(this, C, null);
    }), n(this, B, (t) => {
      var o;
      n(this, m, !0);
      const e = i(this, k, A);
      if (!e)
        return;
      e.dom.dataset.dragging = "true";
      const r = i(this, C);
      if (t.dataTransfer && r) {
        const l = r.content();
        t.dataTransfer.effectAllowed = "copyMove";
        const { dom: c, text: h } = yt(e, l);
        t.dataTransfer.clearData(), t.dataTransfer.setData(it ? "Text" : "text/html", c.innerHTML), it || t.dataTransfer.setData("text/plain", h);
        const d = (o = i(this, g)) == null ? void 0 : o.el;
        d && t.dataTransfer.setDragImage(d, 0, 0), e.dragging = {
          slice: l,
          move: !0
        };
      }
    }), this.keydownCallback = (t) => (i(this, v).call(this), n(this, m, !1), t.dom.dataset.dragging = "false", !1), n(this, K, dt((t, e) => {
      if (!t.editable)
        return;
      const r = t.dom.getBoundingClientRect(), o = r.left + r.width / 2;
      if (!(t.root.elementFromPoint(o, e.clientY) instanceof Element)) {
        i(this, v).call(this);
        return;
      }
      const c = i(this, k, st);
      if (!c)
        return;
      const h = bt(t, { x: o, y: e.clientY }, c);
      if (!h) {
        i(this, v).call(this);
        return;
      }
      i(this, F).call(this, h);
    }, 200)), this.mousemoveCallback = (t, e) => (t.composing || !t.editable || i(this, K).call(this, t, e), !1), this.dragoverCallback = (t, e) => {
      var r;
      if (i(this, m)) {
        const o = (r = i(this, k, A)) == null ? void 0 : r.dom.parentElement;
        if (!o)
          return !1;
        const l = o.scrollHeight > o.clientHeight, c = o.getBoundingClientRect();
        if (l) {
          if (o.scrollTop > 0 && Math.abs(e.y - c.y) < ot) {
            const u = o.scrollTop > 10 ? o.scrollTop - 10 : 0;
            return o.scrollTop = u, !1;
          }
          const h = Math.round(t.dom.getBoundingClientRect().height);
          if (Math.round(o.scrollTop + c.height) < h && Math.abs(e.y - (c.height + c.y)) < ot) {
            const u = o.scrollTop + 10;
            return o.scrollTop = u, !1;
          }
        }
      }
      return !1;
    }, this.dragenterCallback = (t) => {
      t.dragging && (n(this, m, !0), t.dom.dataset.dragging = "true");
    }, this.dragleaveCallback = (t, e) => {
      const r = e.clientX, o = e.clientY;
      (r < 0 || o < 0 || r > window.innerWidth || o > window.innerHeight) && (n(this, g, null), i(this, w).call(this, t));
    }, this.dropCallback = (t) => (i(this, w).call(this, t), !1), this.dragendCallback = (t) => {
      i(this, w).call(this, t);
    }, n(this, w, (t) => {
      n(this, m, !1), t.dom.dataset.dragging = "false";
    });
  }
}
D = new WeakMap(), H = new WeakMap(), C = new WeakMap(), g = new WeakMap(), T = new WeakMap(), m = new WeakMap(), k = new WeakSet(), st = function() {
  var t;
  return (t = i(this, D)) == null ? void 0 : t.get(_.key).filterNodes;
}, A = function() {
  var t;
  return (t = i(this, D)) == null ? void 0 : t.get(q);
}, y = new WeakMap(), v = new WeakMap(), F = new WeakMap(), M = new WeakMap(), P = new WeakMap(), B = new WeakMap(), K = new WeakMap(), w = new WeakMap();
const V = J(new vt(), "blockService");
W(_, {
  displayName: "Ctx<blockService>"
});
const X = J({}, "blockSpec");
W(_, {
  displayName: "Ctx<blockSpec>"
});
const G = lt((s) => {
  const t = new ct("MILKDOWN_BLOCK"), e = s.get(V.key), r = s.get(X.key);
  return new ht({
    key: t,
    ...r,
    props: {
      ...r.props,
      handleDOMEvents: {
        drop: (o) => e.dropCallback(o),
        pointermove: (o, l) => e.mousemoveCallback(o, l),
        keydown: (o) => e.keydownCallback(o),
        dragover: (o, l) => e.dragoverCallback(o, l),
        dragleave: (o, l) => e.dragleaveCallback(o, l),
        dragenter: (o) => e.dragenterCallback(o),
        dragend: (o) => e.dragendCallback(o)
      }
    }
  });
});
W(G, {
  displayName: "Prose<block>"
});
var f, b, x, E, N, L, O, $, U, nt;
class Bt {
  constructor(t) {
    a(this, U);
    /// @internal
    a(this, f);
    /// @internal
    a(this, b);
    /// @internal
    a(this, x);
    a(this, E);
    a(this, N);
    /// @internal
    a(this, L);
    /// @internal
    a(this, O);
    /// @internal
    a(this, $);
    n(this, E, null), n(this, N, !1), this.update = () => {
      requestAnimationFrame(() => {
        if (!i(this, N))
          try {
            Z(this, U, nt).call(this), n(this, N, !0);
          } catch {
          }
      });
    }, this.destroy = () => {
      var e, r;
      (e = i(this, x)) == null || e.unBind(), (r = i(this, x)) == null || r.removeEvent(i(this, f)), i(this, f).remove();
    }, this.show = (e) => {
      const r = e.el, o = i(this, b).get(q).dom, l = {
        ctx: i(this, b),
        active: e,
        editorDom: o,
        blockDom: i(this, f)
      }, c = {
        contextElement: r,
        getBoundingClientRect: () => i(this, O) ? i(this, O).call(this, l) : r.getBoundingClientRect()
      }, h = [ft()];
      if (i(this, L)) {
        const d = i(this, L).call(this, l), u = pt(d);
        h.push(u);
      }
      gt(c, i(this, f), {
        placement: i(this, $) ? i(this, $).call(this, l) : "left",
        middleware: h
      }).then(({ x: d, y: u }) => {
        Object.assign(i(this, f).style, {
          left: `${d}px`,
          top: `${u}px`
        }), i(this, f).dataset.show = "true";
      });
    }, this.hide = () => {
      i(this, f).dataset.show = "false";
    }, n(this, b, t.ctx), n(this, f, t.content), n(this, L, t.getOffset), n(this, O, t.getPosition), n(this, $, t.getPlacement), this.hide();
  }
  /// The context of current active node.
  get active() {
    return i(this, E);
  }
}
f = new WeakMap(), b = new WeakMap(), x = new WeakMap(), E = new WeakMap(), N = new WeakMap(), L = new WeakMap(), O = new WeakMap(), $ = new WeakMap(), U = new WeakSet(), /// @internal
nt = function() {
  var r;
  (r = i(this, b).get(q).dom.parentElement) == null || r.appendChild(i(this, f));
  const e = i(this, b).get(V.key);
  e.bind(i(this, b), (o) => {
    o.type === "hide" ? (this.hide(), n(this, E, null)) : o.type === "show" && (this.show(o.active), n(this, E, o.active));
  }), n(this, x, e), i(this, x).addEvent(i(this, f)), i(this, f).draggable = !0;
};
const rt = [X, _, V, G];
rt.key = X.key;
rt.pluginKey = G.key;
export {
  Bt as BlockProvider,
  vt as BlockService,
  rt as block,
  _ as blockConfig,
  G as blockPlugin,
  V as blockService,
  X as blockSpec,
  mt as defaultNodeFilter
};
//# sourceMappingURL=index.es.js.map
