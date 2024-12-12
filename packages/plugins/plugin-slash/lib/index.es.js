var H = (s) => {
  throw TypeError(s);
};
var C = (s, e, t) => e.has(s) || H("Cannot " + t);
var o = (s, e, t) => (C(s, e, "read from private field"), t ? t.call(s) : e.get(s)), i = (s, e, t) => e.has(s) ? H("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), a = (s, e, t, n) => (C(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t), A = (s, e, t) => (C(s, e, "access private method"), t);
import { Plugin as N, PluginKey as T, TextSelection as _ } from "@milkdown/prose/state";
import { $ctx as F, $prose as I } from "@milkdown/utils";
import { findParentNode as R, posToDOMRect as U } from "@milkdown/prose";
import q from "lodash.debounce";
import { computePosition as K, flip as L, offset as j } from "@floating-ui/dom";
function W(s) {
  const e = F(
    {},
    `${s}_SLASH_SPEC`
  ), t = I((r) => {
    const m = r.get(e.key);
    return new N({
      key: new T(`${s}_SLASH`),
      ...m
    });
  }), n = [e, t];
  return n.key = e.key, n.pluginKey = t.key, e.meta = {
    package: "@milkdown/plugin-slash",
    displayName: `Ctx<slashSpec>|${s}`
  }, t.meta = {
    package: "@milkdown/plugin-slash",
    displayName: `Prose<slash>|${s}`
  }, n;
}
var c, d, u, f, h, g, y, S, x, B;
class X {
  constructor(e) {
    i(this, x);
    i(this, c);
    /// @internal
    i(this, d);
    /// @internal
    i(this, u);
    /// @internal
    i(this, f);
    /// @internal
    i(this, h);
    /// @internal
    i(this, g);
    /// The offset to get the block. Default is 0.
    i(this, y);
    i(this, S);
    a(this, c, !1), this.onShow = () => {
    }, this.onHide = () => {
    }, a(this, S, (t, n) => {
      var E;
      const { state: r, composing: m } = t, { selection: l, doc: $ } = r, { ranges: k } = l, w = Math.min(...k.map((p) => p.$from.pos)), P = Math.max(...k.map((p) => p.$to.pos)), b = n && n.doc.eq($) && n.selection.eq(l);
      if (o(this, c) || ((E = t.dom.parentElement) == null || E.appendChild(this.element), a(this, c, !0)), m || b) return;
      if (!o(this, g).call(this, t, n)) {
        this.hide();
        return;
      }
      K({
        getBoundingClientRect: () => U(t, w, P)
      }, this.element, {
        placement: "bottom-start",
        middleware: [L(), j(o(this, y)), ...o(this, d)],
        ...o(this, u)
      }).then(({ x: p, y: M }) => {
        Object.assign(this.element.style, {
          left: `${p}px`,
          top: `${M}px`
        });
      }), this.show();
    }), this.update = (t, n) => {
      q(o(this, S), o(this, f))(t, n);
    }, this.getContent = (t, n = (r) => r.type.name === "paragraph") => {
      const { selection: r } = t.state, { empty: m, $from: l } = r, $ = t.state.selection instanceof _, k = this.element.contains(document.activeElement), w = !t.hasFocus() && !k, P = !t.editable, O = !R(n)(t.state.selection);
      if (!(w || P || !m || !$ || O))
        return l.parent.textBetween(
          Math.max(0, l.parentOffset - 500),
          l.parentOffset,
          void 0,
          "￼"
        );
    }, this.destroy = () => {
    }, this.show = () => {
      this.element.dataset.show = "true", this.onShow();
    }, this.hide = () => {
      this.element.dataset.show = "false", this.onHide();
    }, this.element = e.content, a(this, f, e.debounce ?? 200), a(this, g, e.shouldShow ?? A(this, x, B)), a(this, h, e.trigger ?? "/"), a(this, y, e.offset), a(this, d, e.middleware ?? []), a(this, u, e.floatingUIOptions ?? {});
  }
}
c = new WeakMap(), d = new WeakMap(), u = new WeakMap(), f = new WeakMap(), h = new WeakMap(), g = new WeakMap(), y = new WeakMap(), S = new WeakMap(), x = new WeakSet(), /// @internal
B = function(e) {
  const t = this.getContent(e);
  if (!t) return !1;
  const n = t.at(-1);
  return n ? Array.isArray(o(this, h)) ? o(this, h).includes(n) : o(this, h) === n : !1;
};
export {
  X as SlashProvider,
  W as slashFactory
};
//# sourceMappingURL=index.es.js.map
