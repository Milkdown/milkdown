var K = (o) => {
  throw TypeError(o);
};
var w = (o, t, e) => t.has(o) || K("Cannot " + e);
var s = (o, t, e) => (w(o, t, "read from private field"), e ? e.call(o) : t.get(o)), a = (o, t, e) => t.has(o) ? K("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(o) : t.set(o, e), l = (o, t, e, i) => (w(o, t, "write to private field"), i ? i.call(o, e) : t.set(o, e), e), g = (o, t, e) => (w(o, t, "access private method"), e);
import { createSlice as A, createTimer as R } from "@milkdown/ctx";
import { schemaCtx as x, parserCtx as j, getDoc as E, prosePluginsCtx as C, editorViewCtx as L, EditorViewReady as X } from "@milkdown/core";
import { ctxNotBind as y, missingYjsDoc as D } from "@milkdown/exception";
import { keydownHandler as Y } from "@milkdown/prose/keymap";
import { PluginKey as z, Plugin as B } from "@milkdown/prose/state";
import { ySyncPlugin as V, yUndoPlugin as _, undo as H, redo as O, yCursorPlugin as I, yXmlFragmentToProseMirrorRootNode as W, prosemirrorToYDoc as q, ySyncPluginKey as G, yCursorPluginKey as J, yUndoPluginKey as Q } from "y-prosemirror";
import { encodeStateAsUpdate as Z, applyUpdate as $ } from "yjs";
const k = new z("MILKDOWN_COLLAB_KEYMAP"), tt = [
  k,
  G,
  J,
  Q
];
var h, r, m, n, u, c, M, N, b;
class F {
  constructor() {
    a(this, c);
    /// @internal
    a(this, h, {});
    /// @internal
    a(this, r, null);
    /// @internal
    a(this, m, null);
    /// @internal
    a(this, n, null);
    /// @internal
    a(this, u, !1);
  }
  /// Bind the context to the service.
  bindCtx(t) {
    return l(this, n, t), this;
  }
  /// Bind the document to the service.
  bindDoc(t) {
    return l(this, r, t.getXmlFragment("prosemirror")), this;
  }
  /// Bind the Yjs XmlFragment to the service.
  bindXmlFragment(t) {
    return l(this, r, t), this;
  }
  /// Set the options of the service.
  setOptions(t) {
    return l(this, h, t), this;
  }
  /// Merge some options to the service.
  /// The options will be merged to the existing options.
  /// THe options should be partial of the `CollabServiceOptions`.
  mergeOptions(t) {
    return Object.assign(s(this, h), t), this;
  }
  /// Set the awareness of the service.
  setAwareness(t) {
    return l(this, m, t), this;
  }
  /// Apply the template to the document.
  applyTemplate(t, e) {
    if (!s(this, n)) throw y();
    if (!s(this, r)) throw D();
    const i = e || ((p) => p.textContent.length === 0), d = g(this, c, M).call(this, t), f = s(this, n).get(x), T = W(
      s(this, r),
      f
    );
    if (d && i(T, d)) {
      const p = s(this, r);
      p.delete(0, p.length);
      const S = q(d), U = Z(S);
      p.doc && $(p.doc, U), S.destroy();
    }
    return this;
  }
  /// Connect the service.
  connect() {
    if (!s(this, n)) throw y();
    if (s(this, u)) return;
    const t = s(this, n).get(C), e = g(this, c, N).call(this), i = t.concat(e);
    return g(this, c, b).call(this, i), l(this, u, !0), this;
  }
  /// Disconnect the service.
  disconnect() {
    if (!s(this, n)) throw y();
    if (!s(this, u)) return this;
    const e = s(this, n).get(C).filter(
      (i) => !i.spec.key || !tt.includes(i.spec.key)
    );
    return g(this, c, b).call(this, e), l(this, u, !1), this;
  }
}
h = new WeakMap(), r = new WeakMap(), m = new WeakMap(), n = new WeakMap(), u = new WeakMap(), c = new WeakSet(), /// @internal
M = function(t) {
  if (!s(this, n)) throw y();
  const e = s(this, n).get(x), i = s(this, n).get(j);
  return E(t, i, e);
}, /// @internal
N = function() {
  if (!s(this, r)) throw D();
  const { ySyncOpts: t, yUndoOpts: e } = s(this, h), i = [
    V(s(this, r), t),
    _(e),
    new B({
      key: k,
      props: {
        handleKeyDown: Y({
          "Mod-z": H,
          "Mod-y": O,
          "Mod-Shift-z": O
        })
      }
    })
  ];
  if (s(this, m)) {
    const { yCursorOpts: d, yCursorStateField: f } = s(this, h);
    i.push(
      I(
        s(this, m),
        d,
        f
      )
    );
  }
  return i;
}, /// @internal
b = function(t) {
  if (!s(this, n)) throw y();
  s(this, n).set(C, t);
  const e = s(this, n).get(L), i = e.state.reconfigure({ plugins: t });
  e.updateState(i);
};
const v = A(
  new F(),
  "collabServiceCtx"
), P = R("CollabReady"), et = (o) => {
  const t = new F();
  return o.inject(v, t).record(P), async () => (await o.wait(X), t.bindCtx(o), o.done(P), () => {
    o.remove(v).clearTimer(P);
  });
};
et.meta = {
  package: "@milkdown/plugin-collab",
  displayName: "Collab"
};
export {
  k as CollabKeymapPluginKey,
  P as CollabReady,
  F as CollabService,
  et as collab,
  v as collabServiceCtx
};
//# sourceMappingURL=index.es.js.map
