var D = (o) => {
  throw TypeError(o);
};
var C = (o, t, s) => t.has(o) || D("Cannot " + s);
var e = (o, t, s) => (C(o, t, "read from private field"), s ? s.call(o) : t.get(o)), a = (o, t, s) => t.has(o) ? D("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(o) : t.set(o, s), h = (o, t, s, n) => (C(o, t, "write to private field"), n ? n.call(o, s) : t.set(o, s), s), m = (o, t, s) => (C(o, t, "access private method"), s);
import { createSlice as F, createTimer as j } from "@milkdown/ctx";
import { schemaCtx as x, parserCtx as E, getDoc as L, prosePluginsCtx as P, editorViewCtx as R, EditorViewReady as Y } from "@milkdown/core";
import { ctxNotBind as g, missingYjsDoc as O } from "@milkdown/exception";
import { keydownHandler as z } from "@milkdown/prose/keymap";
import { PluginKey as B, Plugin as V } from "@milkdown/prose/state";
import { ySyncPlugin as X, yUndoPlugin as _, undo as H, redo as v, yCursorPlugin as I, yDocToProsemirror as W, prosemirrorToYDoc as q, ySyncPluginKey as G, yCursorPluginKey as J, yUndoPluginKey as Q } from "y-prosemirror";
import { encodeStateAsUpdate as Z, applyUpdate as $ } from "yjs";
const T = new B("MILKDOWN_COLLAB_KEYMAP"), tt = [T, G, J, Q];
var u, r, d, i, p, c, N, U, S;
class M {
  constructor() {
    a(this, c);
    /// @internal
    a(this, u, {});
    /// @internal
    a(this, r, null);
    /// @internal
    a(this, d, null);
    /// @internal
    a(this, i, null);
    /// @internal
    a(this, p, !1);
  }
  /// Bind the context to the service.
  bindCtx(t) {
    return h(this, i, t), this;
  }
  /// Bind the document to the service.
  bindDoc(t) {
    return h(this, r, t), this;
  }
  /// Set the options of the service.
  setOptions(t) {
    return h(this, u, t), this;
  }
  /// Merge some options to the service.
  /// The options will be merged to the existing options.
  /// THe options should be partial of the `CollabServiceOptions`.
  mergeOptions(t) {
    return Object.assign(e(this, u), t), this;
  }
  /// Set the awareness of the service.
  setAwareness(t) {
    return h(this, d, t), this;
  }
  /// Apply the template to the document.
  applyTemplate(t, s) {
    if (!e(this, i))
      throw g();
    if (!e(this, r))
      throw O();
    const n = s || ((y) => y.textContent.length === 0), l = m(this, c, N).call(this, t), f = e(this, i).get(x), w = W(f, e(this, r));
    if (l && n(w, l)) {
      const y = e(this, r).getXmlFragment("prosemirror");
      y.delete(0, y.length);
      const K = q(l), A = Z(K);
      $(e(this, r), A), K.destroy();
    }
    return this;
  }
  /// Connect the service.
  connect() {
    if (!e(this, i))
      throw g();
    if (e(this, p))
      return;
    const t = e(this, i).get(P), s = m(this, c, U).call(this), n = t.concat(s);
    return m(this, c, S).call(this, n), h(this, p, !0), this;
  }
  /// Disconnect the service.
  disconnect() {
    if (!e(this, i))
      throw g();
    if (!e(this, p))
      return this;
    const s = e(this, i).get(P).filter(
      (n) => !n.spec.key || !tt.includes(n.spec.key)
    );
    return m(this, c, S).call(this, s), h(this, p, !1), this;
  }
}
u = new WeakMap(), r = new WeakMap(), d = new WeakMap(), i = new WeakMap(), p = new WeakMap(), c = new WeakSet(), /// @internal
N = function(t) {
  if (!e(this, i))
    throw g();
  const s = e(this, i).get(x), n = e(this, i).get(E);
  return L(t, n, s);
}, /// @internal
U = function() {
  if (!e(this, r))
    throw O();
  const { ySyncOpts: t, yUndoOpts: s } = e(this, u), n = e(this, r).getXmlFragment("prosemirror"), l = [
    X(n, t),
    _(s),
    new V({
      key: T,
      props: {
        handleKeyDown: z({
          "Mod-z": H,
          "Mod-y": v,
          "Mod-Shift-z": v
        })
      }
    })
  ];
  if (e(this, d)) {
    const { yCursorOpts: f, yCursorStateField: w } = e(this, u);
    l.push(I(e(this, d), f, w));
  }
  return l;
}, /// @internal
S = function(t) {
  if (!e(this, i))
    throw g();
  e(this, i).set(P, t);
  const s = e(this, i).get(R), n = s.state.reconfigure({ plugins: t });
  s.updateState(n);
};
const k = F(new M(), "collabServiceCtx"), b = j("CollabReady"), et = (o) => {
  const t = new M();
  return o.inject(k, t).record(b), async () => (await o.wait(Y), t.bindCtx(o), o.done(b), () => {
    o.remove(k).clearTimer(b);
  });
};
et.meta = {
  package: "@milkdown/plugin-collab",
  displayName: "Collab"
};
export {
  T as CollabKeymapPluginKey,
  b as CollabReady,
  M as CollabService,
  et as collab,
  k as collabServiceCtx
};
//# sourceMappingURL=index.es.js.map
