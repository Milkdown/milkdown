import { createSlice as c } from "@milkdown/ctx";
import { InitReady as m, SerializerReady as L, serializerCtx as w, prosePluginsCtx as y, EditorViewReady as b } from "@milkdown/core";
import { PluginKey as g, Plugin as k } from "@milkdown/prose/state";
import E from "lodash.debounce";
class l {
  constructor() {
    this.beforeMountedListeners = [], this.mountedListeners = [], this.updatedListeners = [], this.markdownUpdatedListeners = [], this.blurListeners = [], this.focusListeners = [], this.destroyListeners = [], this.beforeMount = (s) => (this.beforeMountedListeners.push(s), this), this.mounted = (s) => (this.mountedListeners.push(s), this), this.updated = (s) => (this.updatedListeners.push(s), this);
  }
  /// A getter to get all [subscribers](#interface-subscribers). You should not use this method directly.
  get listeners() {
    return {
      beforeMount: this.beforeMountedListeners,
      mounted: this.mountedListeners,
      updated: this.updatedListeners,
      markdownUpdated: this.markdownUpdatedListeners,
      blur: this.blurListeners,
      focus: this.focusListeners,
      destroy: this.destroyListeners
    };
  }
  /// Subscribe to the markdownUpdated event.
  /// This event will be triggered after the editor state is updated and **the document is changed**.
  /// The second parameter is the current markdown and the third parameter is the previous markdown.
  markdownUpdated(s) {
    return this.markdownUpdatedListeners.push(s), this;
  }
  /// Subscribe to the blur event.
  /// This event will be triggered when the editor is blurred.
  blur(s) {
    return this.blurListeners.push(s), this;
  }
  /// Subscribe to the focus event.
  /// This event will be triggered when the editor is focused.
  focus(s) {
    return this.focusListeners.push(s), this;
  }
  /// Subscribe to the destroy event.
  /// This event will be triggered before the editor is destroyed.
  destroy(s) {
    return this.destroyListeners.push(s), this;
  }
}
const h = c(new l(), "listener"), M = new g("MILKDOWN_LISTENER"), U = (t) => (t.inject(h, new l()), async () => {
  await t.wait(m);
  const s = t.get(h), { listeners: r } = s;
  r.beforeMount.forEach((e) => e(t)), await t.wait(L);
  const u = t.get(w);
  let n = null, d = null;
  const p = new k({
    key: M,
    view: () => ({
      destroy: () => {
        r.destroy.forEach((e) => e(t));
      }
    }),
    props: {
      handleDOMEvents: {
        focus: () => (r.focus.forEach((e) => e(t)), !1),
        blur: () => (r.blur.forEach((e) => e(t)), !1)
      }
    },
    state: {
      init: (e, a) => {
        n = a.doc, d = u(a.doc);
      },
      apply: (e) => !e.docChanged || e.getMeta("addToHistory") === !1 ? void 0 : E(() => {
        const { doc: i } = e;
        if (r.updated.length > 0 && n && !n.eq(i) && r.updated.forEach((o) => {
          o(t, i, n);
        }), r.markdownUpdated.length > 0 && n && !n.eq(i)) {
          const o = u(i);
          r.markdownUpdated.forEach((f) => {
            f(t, o, d);
          }), d = o;
        }
        n = i;
      }, 200)()
    }
  });
  t.update(y, (e) => e.concat(p)), await t.wait(b), r.mounted.forEach((e) => e(t));
});
U.meta = {
  package: "@milkdown/plugin-listener",
  displayName: "Listener"
};
export {
  l as ListenerManager,
  M as key,
  U as listener,
  h as listenerCtx
};
//# sourceMappingURL=index.es.js.map
