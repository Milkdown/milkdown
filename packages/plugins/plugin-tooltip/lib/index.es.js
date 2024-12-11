var T = (o) => {
  throw TypeError(o);
};
var k = (o, t, e) => t.has(o) || T("Cannot " + e);
var n = (o, t, e) => (k(o, t, "read from private field"), e ? e.call(o) : t.get(o)), l = (o, t, e) => t.has(o) ? T("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(o) : t.set(o, e), h = (o, t, e, s) => (k(o, t, "write to private field"), s ? s.call(o, e) : t.set(o, e), e), O = (o, t, e) => (k(o, t, "access private method"), e);
import { TextSelection as F, Plugin as H, PluginKey as M } from "@milkdown/prose/state";
import R from "lodash.debounce";
import { computePosition as S, flip as b, offset as C, shift as j } from "@floating-ui/dom";
import { posToDOMRect as q } from "@milkdown/prose";
import { $ctx as I, $prose as K } from "@milkdown/utils";
var r, d, c, a, u, y, E;
class J {
  constructor(t) {
    l(this, y);
    /// @internal
    l(this, r);
    /// @internal
    l(this, d);
    l(this, c);
    /// @internal
    l(this, a);
    l(this, u);
    h(this, c, !1), this.onShow = () => {
    }, this.onHide = () => {
    }, h(this, u, (e, s) => {
      var P;
      const { state: i, composing: p } = e, { selection: f, doc: w } = i, { ranges: g } = f, $ = Math.min(...g.map((m) => m.$from.pos)), x = Math.max(...g.map((m) => m.$to.pos)), _ = s && s.doc.eq(w) && s.selection.eq(f);
      if (n(this, c) || ((P = e.dom.parentElement) == null || P.appendChild(this.element), h(this, c, !0)), p || _)
        return;
      if (!n(this, d).call(this, e, s)) {
        this.hide();
        return;
      }
      S({
        getBoundingClientRect: () => q(e, $, x)
      }, this.element, {
        placement: "top",
        middleware: [b(), C(n(this, a)), j()]
      }).then(({ x: m, y: B }) => {
        Object.assign(this.element.style, {
          left: `${m}px`,
          top: `${B}px`
        });
      }), this.show();
    }), this.update = (e, s) => {
      R(n(this, u), n(this, r))(e, s);
    }, this.destroy = () => {
    }, this.show = (e) => {
      this.element.dataset.show = "true", e && S(e, this.element, {
        placement: "top",
        middleware: [b(), C(n(this, a))]
      }).then(({ x: s, y: i }) => {
        Object.assign(this.element.style, {
          left: `${s}px`,
          top: `${i}px`
        });
      }), this.onShow();
    }, this.hide = () => {
      this.element.dataset.show !== "false" && (this.element.dataset.show = "false", this.onHide());
    }, this.element = t.content, h(this, r, t.debounce ?? 200), h(this, d, t.shouldShow ?? O(this, y, E)), h(this, a, t.offset), this.element.dataset.show = "false";
  }
}
r = new WeakMap(), d = new WeakMap(), c = new WeakMap(), a = new WeakMap(), u = new WeakMap(), y = new WeakSet(), /// @internal
E = function(t) {
  const { doc: e, selection: s } = t.state, { empty: i, from: p, to: f } = s, w = !e.textBetween(p, f).length && t.state.selection instanceof F, g = this.element.contains(document.activeElement), $ = !t.hasFocus() && !g, x = !t.editable;
  return !($ || i || w || x);
};
function Q(o) {
  const t = I({}, `${o}_TOOLTIP_SPEC`), e = K((i) => {
    const p = i.get(t.key);
    return new H({
      key: new M(`${o}_TOOLTIP`),
      ...p
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
  J as TooltipProvider,
  Q as tooltipFactory
};
//# sourceMappingURL=index.es.js.map
