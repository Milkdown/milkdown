var E = (s) => {
  throw TypeError(s);
};
var P = (s, e, t) => e.has(s) || E("Cannot " + t);
var o = (s, e, t) => (P(s, e, "read from private field"), t ? t.call(s) : e.get(s)), a = (s, e, t) => e.has(s) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), r = (s, e, t, n) => (P(s, e, "write to private field"), n ? n.call(s, t) : e.set(s, t), t), H = (s, e, t) => (P(s, e, "access private method"), t);
import { Plugin as M, PluginKey as N, TextSelection as O } from "@milkdown/prose/state";
import { $ctx as T, $prose as _ } from "@milkdown/utils";
import { findParentNode as F, posToDOMRect as R } from "@milkdown/prose";
import q from "lodash.debounce";
import { computePosition as K, flip as L, offset as j } from "@floating-ui/dom";
function Q(s) {
  const e = T({}, `${s}_SLASH_SPEC`), t = _((i) => {
    const m = i.get(e.key);
    return new M({
      key: new N(`${s}_SLASH`),
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
var l, u, h, d, f, g, S, A;
class V {
  constructor(e) {
    a(this, S);
    a(this, l);
    /// @internal
    a(this, u);
    /// @internal
    a(this, h);
    /// @internal
    a(this, d);
    /// The offset to get the block. Default is 0.
    a(this, f);
    a(this, g);
    r(this, l, !1), this.onShow = () => {
    }, this.onHide = () => {
    }, r(this, g, (t, n) => {
      var b;
      const { state: i, composing: m } = t, { selection: c, doc: k } = i, { ranges: y } = c, x = Math.min(...y.map((p) => p.$from.pos)), $ = Math.max(...y.map((p) => p.$to.pos)), w = n && n.doc.eq(k) && n.selection.eq(c);
      if (o(this, l) || ((b = t.dom.parentElement) == null || b.appendChild(this.element), r(this, l, !0)), m || w)
        return;
      if (!o(this, d).call(this, t, n)) {
        this.hide();
        return;
      }
      K({
        getBoundingClientRect: () => R(t, x, $)
      }, this.element, {
        placement: "bottom-start",
        middleware: [L(), j(o(this, f))]
      }).then(({ x: p, y: B }) => {
        Object.assign(this.element.style, {
          left: `${p}px`,
          top: `${B}px`
        });
      }), this.show();
    }), this.update = (t, n) => {
      q(o(this, g), o(this, u))(t, n);
    }, this.getContent = (t, n = (i) => i.type.name === "paragraph") => {
      const { selection: i } = t.state, { empty: m, $from: c } = i, k = t.state.selection instanceof O, y = this.element.contains(document.activeElement), x = !t.hasFocus() && !y, $ = !t.editable, C = !F(n)(t.state.selection);
      if (!(x || $ || !m || !k || C))
        return c.parent.textBetween(Math.max(0, c.parentOffset - 500), c.parentOffset, void 0, "￼");
    }, this.destroy = () => {
    }, this.show = () => {
      this.element.dataset.show = "true", this.onShow();
    }, this.hide = () => {
      this.element.dataset.show = "false", this.onHide();
    }, this.element = e.content, r(this, u, e.debounce ?? 200), r(this, d, e.shouldShow ?? H(this, S, A)), r(this, h, e.trigger ?? "/"), r(this, f, e.offset);
  }
}
l = new WeakMap(), u = new WeakMap(), h = new WeakMap(), d = new WeakMap(), f = new WeakMap(), g = new WeakMap(), S = new WeakSet(), /// @internal
A = function(e) {
  const t = this.getContent(e);
  if (!t)
    return !1;
  const n = t.at(-1);
  return n ? Array.isArray(o(this, h)) ? o(this, h).includes(n) : o(this, h) === n : !1;
};
export {
  V as SlashProvider,
  Q as slashFactory
};
//# sourceMappingURL=index.es.js.map
