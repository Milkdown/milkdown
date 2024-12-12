var S = (o) => {
  throw TypeError(o);
};
var P = (o, t, e) => t.has(o) || S("Cannot " + e);
var i = (o, t, e) => (P(o, t, "read from private field"), e ? e.call(o) : t.get(o)), n = (o, t, e) => t.has(o) ? S("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(o) : t.set(o, e), l = (o, t, e, s) => (P(o, t, "write to private field"), s ? s.call(o, e) : t.set(o, e), e), b = (o, t, e) => (P(o, t, "access private method"), e);
import { TextSelection as H, Plugin as M, PluginKey as R } from "@milkdown/prose/state";
import U from "lodash.debounce";
import { computePosition as C, flip as E, offset as I, shift as j } from "@floating-ui/dom";
import { posToDOMRect as q } from "@milkdown/prose";
import { $ctx as K, $prose as L } from "@milkdown/utils";
var r, d, u, f, a, c, g, $, _;
class V {
  constructor(t) {
    n(this, $);
    /// @internal
    n(this, r);
    /// @internal
    n(this, d);
    /// @internal
    n(this, u);
    /// @internal
    n(this, f);
    n(this, a);
    /// @internal
    n(this, c);
    n(this, g);
    l(this, a, !1), this.onShow = () => {
    }, this.onHide = () => {
    }, l(this, g, (e, s) => {
      var T;
      const { state: h, composing: m } = e, { selection: y, doc: x } = h, { ranges: w } = y, k = Math.min(...w.map((p) => p.$from.pos)), O = Math.max(...w.map((p) => p.$to.pos)), B = s && s.doc.eq(x) && s.selection.eq(y);
      if (i(this, a) || ((T = e.dom.parentElement) == null || T.appendChild(this.element), l(this, a, !0)), m || B) return;
      if (!i(this, d).call(this, e, s)) {
        this.hide();
        return;
      }
      C({
        getBoundingClientRect: () => q(e, k, O)
      }, this.element, {
        placement: "top",
        middleware: [E(), I(i(this, c)), j(), ...i(this, u)]
      }).then(({ x: p, y: F }) => {
        Object.assign(this.element.style, {
          left: `${p}px`,
          top: `${F}px`
        });
      }), this.show();
    }), this.update = (e, s) => {
      U(i(this, g), i(this, r))(e, s);
    }, this.destroy = () => {
    }, this.show = (e) => {
      this.element.dataset.show = "true", e && C(e, this.element, {
        placement: "top",
        middleware: [E(), I(i(this, c))],
        ...i(this, f)
      }).then(({ x: s, y: h }) => {
        Object.assign(this.element.style, {
          left: `${s}px`,
          top: `${h}px`
        });
      }), this.onShow();
    }, this.hide = () => {
      this.element.dataset.show !== "false" && (this.element.dataset.show = "false", this.onHide());
    }, this.element = t.content, l(this, r, t.debounce ?? 200), l(this, d, t.shouldShow ?? b(this, $, _)), l(this, c, t.offset), l(this, u, t.middleware ?? []), l(this, f, t.floatingUIOptions ?? {}), this.element.dataset.show = "false";
  }
}
r = new WeakMap(), d = new WeakMap(), u = new WeakMap(), f = new WeakMap(), a = new WeakMap(), c = new WeakMap(), g = new WeakMap(), $ = new WeakSet(), /// @internal
_ = function(t) {
  const { doc: e, selection: s } = t.state, { empty: h, from: m, to: y } = s, x = !e.textBetween(m, y).length && t.state.selection instanceof H, w = this.element.contains(document.activeElement), k = !t.hasFocus() && !w, O = !t.editable;
  return !(k || h || x || O);
};
function W(o) {
  const t = K(
    {},
    `${o}_TOOLTIP_SPEC`
  ), e = L((h) => {
    const m = h.get(t.key);
    return new M({
      key: new R(`${o}_TOOLTIP`),
      ...m
    });
  }), s = [t, e];
  return s.key = t.key, s.pluginKey = e.key, t.meta = {
    package: "@milkdown/plugin-tooltip",
    displayName: `Ctx<tooltipSpec>|${o}`
  }, e.meta = {
    package: "@milkdown/plugin-tooltip",
    displayName: `Prose<tooltip>|${o}`
  }, s;
}
export {
  V as TooltipProvider,
  W as tooltipFactory
};
//# sourceMappingURL=index.es.js.map
