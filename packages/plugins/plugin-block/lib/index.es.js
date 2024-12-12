var tt = (o) => {
  throw TypeError(o);
};
var J = (o, t, e) => t.has(o) || tt("Cannot " + e);
var i = (o, t, e) => (J(o, t, "read from private field"), e ? e.call(o) : t.get(o)), a = (o, t, e) => t.has(o) ? tt("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(o) : t.set(o, e), n = (o, t, e, r) => (J(o, t, "write to private field"), r ? r.call(o, e) : t.set(o, e), e), et = (o, t, e) => (J(o, t, "access private method"), e);
import { $ctx as X, $prose as ct } from "@milkdown/utils";
import { findParent as dt, browser as W } from "@milkdown/prose";
import { NodeSelection as it, PluginKey as ht, Plugin as ut } from "@milkdown/prose/state";
import { editorViewCtx as V } from "@milkdown/core";
import ft from "lodash.throttle";
import { DOMSerializer as pt } from "@milkdown/prose/model";
import { flip as mt, offset as gt, computePosition as bt } from "@floating-ui/dom";
function j(o, t) {
  return Object.assign(o, {
    meta: {
      package: "@milkdown/plugin-block",
      ...t
    }
  }), o;
}
const kt = (o) => !dt((e) => e.type.name === "table")(o), _ = X(
  { filterNodes: kt },
  "blockConfig"
);
j(_, {
  displayName: "Ctx<blockConfig>"
});
function Ct(o, t, e) {
  var s;
  if (!o.dom.parentElement) return null;
  try {
    const l = (s = o.posAtCoords({
      left: t.x,
      top: t.y
    })) == null ? void 0 : s.inside;
    if (l == null || l < 0) return null;
    let c = o.state.doc.resolve(l), d = o.state.doc.nodeAt(l), h = o.nodeDOM(l);
    const u = (z) => {
      const q = c.depth >= 1 && c.index(c.depth) === 0;
      if (!(z || q)) return;
      const S = c.before(c.depth);
      d = o.state.doc.nodeAt(S), h = o.nodeDOM(S), c = o.state.doc.resolve(S), e(c, d) || u(!0);
    }, R = e(c, d);
    return u(!R), !h || !d ? null : { node: d, $pos: c, el: h };
  } catch {
    return null;
  }
}
let st = null;
function yt() {
  return st || (st = document.implementation.createHTMLDocument("title"));
}
const vt = {
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
function wt(o, t) {
  const e = [];
  let { openStart: r, openEnd: s, content: l } = t;
  for (; r > 1 && s > 1 && l.childCount === 1 && l.firstChild.childCount === 1; ) {
    r -= 1, s -= 1;
    const p = l.firstChild;
    e.push(
      p.type.name,
      p.attrs !== p.type.defaultAttrs ? p.attrs : null
    ), l = p.content;
  }
  const c = o.someProp("clipboardSerializer") || pt.fromSchema(o.state.schema), d = yt(), h = d.createElement("div");
  h.appendChild(c.serializeFragment(l, { document: d }));
  let u = h.firstChild, R, z = 0;
  for (; u && u.nodeType === 1 && (R = vt[u.nodeName.toLowerCase()]); ) {
    for (let p = R.length - 1; p >= 0; p--) {
      const S = d.createElement(R[p]);
      for (; h.firstChild; ) S.appendChild(h.firstChild);
      h.appendChild(S), z++;
    }
    u = h.firstChild;
  }
  u && u.nodeType === 1 && u.setAttribute(
    "data-pm-slice",
    `${r} ${s}${z ? ` -${z}` : ""} ${JSON.stringify(e)}`
  );
  const q = o.someProp("clipboardTextSerializer", (p) => p(t, o)) || t.content.textBetween(0, t.content.size, `

`);
  return { dom: h, text: q };
}
const ot = W.ie && W.ie_version < 15 || W.ios && W.webkit_version < 604, nt = 20;
var D, H, C, m, T, g, k, rt, A, y, v, F, M, P, B, I, w;
class xt {
  constructor() {
    a(this, k);
    /// @internal
    a(this, D);
    a(this, H);
    a(this, C);
    a(this, m);
    a(this, T);
    a(this, g);
    /// @internal
    a(this, y);
    a(this, v);
    a(this, F);
    a(this, M);
    a(this, P);
    a(this, B);
    a(this, I);
    a(this, w);
    n(this, H, () => {
      if (!i(this, m)) return null;
      const t = i(this, m), e = i(this, k, A);
      if (e && it.isSelectable(t.node)) {
        const r = it.create(
          e.state.doc,
          t.$pos.pos
        );
        return e.dispatch(e.state.tr.setSelection(r)), e.focus(), n(this, C, r), r;
      }
      return null;
    }), n(this, C, null), n(this, m, null), n(this, T, void 0), n(this, g, !1), n(this, v, () => {
      var t;
      (t = i(this, y)) == null || t.call(this, { type: "hide" }), n(this, m, null);
    }), n(this, F, (t) => {
      var e;
      n(this, m, t), (e = i(this, y)) == null || e.call(this, { type: "show", active: t });
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
      n(this, T, (t = i(this, m)) == null ? void 0 : t.el.getBoundingClientRect()), i(this, H).call(this);
    }), n(this, P, () => {
      if (!i(this, g)) {
        requestAnimationFrame(() => {
          var t;
          i(this, T) && ((t = i(this, k, A)) == null || t.focus());
        });
        return;
      }
      n(this, g, !1), n(this, C, null);
    }), n(this, B, (t) => {
      var s;
      n(this, g, !0);
      const e = i(this, k, A);
      if (!e) return;
      e.dom.dataset.dragging = "true";
      const r = i(this, C);
      if (t.dataTransfer && r) {
        const l = r.content();
        t.dataTransfer.effectAllowed = "copyMove";
        const { dom: c, text: d } = wt(e, l);
        t.dataTransfer.clearData(), t.dataTransfer.setData(
          ot ? "Text" : "text/html",
          c.innerHTML
        ), ot || t.dataTransfer.setData("text/plain", d);
        const h = (s = i(this, m)) == null ? void 0 : s.el;
        h && t.dataTransfer.setDragImage(h, 0, 0), e.dragging = {
          slice: l,
          move: !0
        };
      }
    }), this.keydownCallback = (t) => (i(this, v).call(this), n(this, g, !1), t.dom.dataset.dragging = "false", !1), n(this, I, ft((t, e) => {
      if (!t.editable) return;
      const r = t.dom.getBoundingClientRect(), s = r.left + r.width / 2;
      if (!(t.root.elementFromPoint(s, e.clientY) instanceof Element)) {
        i(this, v).call(this);
        return;
      }
      const c = i(this, k, rt);
      if (!c) return;
      const d = Ct(
        t,
        { x: s, y: e.clientY },
        c
      );
      if (!d) {
        i(this, v).call(this);
        return;
      }
      i(this, F).call(this, d);
    }, 200)), this.mousemoveCallback = (t, e) => (t.composing || !t.editable || i(this, I).call(this, t, e), !1), this.dragoverCallback = (t, e) => {
      var r;
      if (i(this, g)) {
        const s = (r = i(this, k, A)) == null ? void 0 : r.dom.parentElement;
        if (!s) return !1;
        const l = s.scrollHeight > s.clientHeight, c = s.getBoundingClientRect();
        if (l) {
          if (s.scrollTop > 0 && Math.abs(e.y - c.y) < nt) {
            const u = s.scrollTop > 10 ? s.scrollTop - 10 : 0;
            return s.scrollTop = u, !1;
          }
          const d = Math.round(t.dom.getBoundingClientRect().height);
          if (Math.round(s.scrollTop + c.height) < d && Math.abs(e.y - (c.height + c.y)) < nt) {
            const u = s.scrollTop + 10;
            return s.scrollTop = u, !1;
          }
        }
      }
      return !1;
    }, this.dragenterCallback = (t) => {
      t.dragging && (n(this, g, !0), t.dom.dataset.dragging = "true");
    }, this.dragleaveCallback = (t, e) => {
      const r = e.clientX, s = e.clientY;
      (r < 0 || s < 0 || r > window.innerWidth || s > window.innerHeight) && (n(this, m, null), i(this, w).call(this, t));
    }, this.dropCallback = (t) => (i(this, w).call(this, t), !1), this.dragendCallback = (t) => {
      i(this, w).call(this, t);
    }, n(this, w, (t) => {
      n(this, g, !1), t.dom.dataset.dragging = "false";
    });
  }
}
D = new WeakMap(), H = new WeakMap(), C = new WeakMap(), m = new WeakMap(), T = new WeakMap(), g = new WeakMap(), k = new WeakSet(), rt = function() {
  var t;
  return (t = i(this, D)) == null ? void 0 : t.get(_.key).filterNodes;
}, A = function() {
  var t;
  return (t = i(this, D)) == null ? void 0 : t.get(V);
}, y = new WeakMap(), v = new WeakMap(), F = new WeakMap(), M = new WeakMap(), P = new WeakMap(), B = new WeakMap(), I = new WeakMap(), w = new WeakMap();
const G = X(new xt(), "blockService");
j(_, {
  displayName: "Ctx<blockService>"
});
const Q = X({}, "blockSpec");
j(_, {
  displayName: "Ctx<blockSpec>"
});
const Z = ct((o) => {
  const t = new ht("MILKDOWN_BLOCK"), e = o.get(G.key), r = o.get(Q.key);
  return new ut({
    key: t,
    ...r,
    props: {
      ...r.props,
      handleDOMEvents: {
        drop: (s) => e.dropCallback(s),
        pointermove: (s, l) => e.mousemoveCallback(s, l),
        keydown: (s) => e.keydownCallback(s),
        dragover: (s, l) => e.dragoverCallback(s, l),
        dragleave: (s, l) => e.dragleaveCallback(s, l),
        dragenter: (s) => e.dragenterCallback(s),
        dragend: (s) => e.dragendCallback(s)
      }
    }
  });
});
j(Z, {
  displayName: "Prose<block>"
});
var f, b, x, E, O, K, U, N, L, $, Y, lt;
class Nt {
  constructor(t) {
    a(this, Y);
    /// @internal
    a(this, f);
    /// @internal
    a(this, b);
    /// @internal
    a(this, x);
    a(this, E);
    a(this, O);
    /// @internal
    a(this, K);
    /// @internal
    a(this, U);
    /// @internal
    a(this, N);
    /// @internal
    a(this, L);
    /// @internal
    a(this, $);
    n(this, E, null), n(this, O, !1), this.update = () => {
      requestAnimationFrame(() => {
        if (!i(this, O))
          try {
            et(this, Y, lt).call(this), n(this, O, !0);
          } catch {
          }
      });
    }, this.destroy = () => {
      var e, r;
      (e = i(this, x)) == null || e.unBind(), (r = i(this, x)) == null || r.removeEvent(i(this, f)), i(this, f).remove();
    }, this.show = (e) => {
      const r = e.el, s = i(this, b).get(V).dom, l = {
        ctx: i(this, b),
        active: e,
        editorDom: s,
        blockDom: i(this, f)
      }, c = {
        contextElement: r,
        getBoundingClientRect: () => i(this, L) ? i(this, L).call(this, l) : r.getBoundingClientRect()
      }, d = [mt()];
      if (i(this, N)) {
        const h = i(this, N).call(this, l), u = gt(h);
        d.push(u);
      }
      bt(c, i(this, f), {
        placement: i(this, $) ? i(this, $).call(this, l) : "left",
        middleware: [...d, ...i(this, K)],
        ...i(this, U)
      }).then(({ x: h, y: u }) => {
        Object.assign(i(this, f).style, {
          left: `${h}px`,
          top: `${u}px`
        }), i(this, f).dataset.show = "true";
      });
    }, this.hide = () => {
      i(this, f).dataset.show = "false";
    }, n(this, b, t.ctx), n(this, f, t.content), n(this, N, t.getOffset), n(this, L, t.getPosition), n(this, $, t.getPlacement), n(this, K, t.middleware ?? []), n(this, U, t.floatingUIOptions ?? {}), this.hide();
  }
  /// The context of current active node.
  get active() {
    return i(this, E);
  }
}
f = new WeakMap(), b = new WeakMap(), x = new WeakMap(), E = new WeakMap(), O = new WeakMap(), K = new WeakMap(), U = new WeakMap(), N = new WeakMap(), L = new WeakMap(), $ = new WeakMap(), Y = new WeakSet(), /// @internal
lt = function() {
  var r;
  (r = i(this, b).get(V).dom.parentElement) == null || r.appendChild(i(this, f));
  const e = i(this, b).get(G.key);
  e.bind(i(this, b), (s) => {
    s.type === "hide" ? (this.hide(), n(this, E, null)) : s.type === "show" && (this.show(s.active), n(this, E, s.active));
  }), n(this, x, e), i(this, x).addEvent(i(this, f)), i(this, f).draggable = !0;
};
const at = [
  Q,
  _,
  G,
  Z
];
at.key = Q.key;
at.pluginKey = Z.key;
export {
  Nt as BlockProvider,
  xt as BlockService,
  at as block,
  _ as blockConfig,
  Z as blockPlugin,
  G as blockService,
  Q as blockSpec,
  kt as defaultNodeFilter
};
//# sourceMappingURL=index.es.js.map
