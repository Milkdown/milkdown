import { schemaCtx as y } from "@milkdown/core";
import { PluginKey as D, Plugin as P } from "@milkdown/prose/state";
import { Decoration as k, DecorationSet as C } from "@milkdown/prose/view";
import { $ctx as b, $prose as U } from "@milkdown/utils";
import { missingNodeInSchema as F } from "@milkdown/exception";
function w(n) {
  return new Promise((s) => {
    const r = new FileReader();
    r.addEventListener(
      "load",
      () => {
        s({
          alt: n.name,
          src: r.result
        });
      },
      !1
    ), r.readAsDataURL(n);
  });
}
const A = async (n, s) => {
  const r = [];
  for (let t = 0; t < n.length; t++) {
    const e = n.item(t);
    e && e.type.includes("image") && r.push(e);
  }
  const { image: l } = s.nodes;
  if (!l)
    throw F("image");
  return (await Promise.all(r.map((t) => w(t)))).map(({ alt: t, src: e }) => l.createAndFill({ src: e, alt: t }));
}, c = b({
  uploader: A,
  enableHtmlFileUploader: !1,
  uploadWidgetFactory: (n, s) => {
    const r = document.createElement("span");
    return r.textContent = "Upload in progress...", k.widget(n, r, s);
  }
}, "uploadConfig");
c.meta = {
  package: "@milkdown/plugin-upload",
  displayName: "Ctx<uploadConfig>"
};
const f = U((n) => {
  const s = new D("MILKDOWN_UPLOAD"), r = (o, t) => {
    var i;
    const e = s.getState(o);
    if (!e)
      return -1;
    const a = e.find(void 0, void 0, (d) => d.id === t);
    return a.length ? ((i = a[0]) == null ? void 0 : i.from) ?? -1 : -1;
  }, l = (o, t, e) => {
    var m;
    if (!e || e.length <= 0)
      return !1;
    const a = Symbol("upload symbol"), i = n.get(y), { tr: d } = o.state, g = t instanceof DragEvent ? ((m = o.posAtCoords({ left: t.clientX, top: t.clientY })) == null ? void 0 : m.pos) ?? d.selection.from : d.selection.from;
    o.dispatch(d.setMeta(s, { add: { id: a, pos: g } }));
    const { uploader: h } = n.get(c.key);
    return h(e, i).then((p) => {
      const u = r(o.state, a);
      u < 0 || o.dispatch(
        o.state.tr.replaceWith(u, u, p).setMeta(s, { remove: { id: a } })
      );
    }).catch((p) => {
      console.error(p);
    }), !0;
  };
  return new P({
    key: s,
    state: {
      init() {
        return C.empty;
      },
      apply(o, t) {
        const e = t.map(o.mapping, o.doc), a = o.getMeta(this);
        if (!a)
          return e;
        if (a.add) {
          const { uploadWidgetFactory: i } = n.get(c.key), d = i(a.add.pos, { id: a.add.id });
          return e.add(o.doc, [d]);
        }
        if (a.remove) {
          const i = e.find(void 0, void 0, (d) => d.id === a.remove.id);
          return e.remove(i);
        }
        return e;
      }
    },
    props: {
      decorations(o) {
        return this.getState(o);
      },
      handlePaste: (o, t) => {
        var a, i;
        const { enableHtmlFileUploader: e } = n.get(c.key);
        return !(t instanceof ClipboardEvent) || !e && ((a = t.clipboardData) != null && a.getData("text/html")) ? !1 : l(o, t, (i = t.clipboardData) == null ? void 0 : i.files);
      },
      handleDrop: (o, t) => {
        var e;
        return t instanceof DragEvent ? l(o, t, (e = t.dataTransfer) == null ? void 0 : e.files) : !1;
      }
    }
  });
});
f.meta = {
  package: "@milkdown/plugin-upload",
  displayName: "Prose<upload>"
};
const W = [c, f];
export {
  A as defaultUploader,
  w as readImageAsBase64,
  W as upload,
  c as uploadConfig,
  f as uploadPlugin
};
//# sourceMappingURL=index.es.js.map
