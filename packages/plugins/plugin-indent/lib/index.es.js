import { TextSelection as a, AllSelection as l } from "@milkdown/prose/state";
import { $ctx as f, $shortcut as d } from "@milkdown/utils";
function u(n, i) {
  const { doc: t, selection: e } = n;
  if (!t || !e || !(e instanceof a || e instanceof l))
    return n;
  const { to: c } = e, o = i.type === "space" ? Array(i.size).fill(" ").join("") : "	";
  return n.insertText(o, c);
}
const r = f({ type: "space", size: 2 }, "indentConfig");
r.meta = {
  package: "@milkdown/plugin-indent",
  displayName: "Ctx<indentConfig>"
};
const s = d((n) => ({
  Tab: (i, t) => {
    const e = n.get(r.key), { tr: c } = i, o = u(c, e);
    return o.docChanged ? (t == null || t(o), !0) : !1;
  }
}));
s.meta = {
  package: "@milkdown/plugin-indent",
  displayName: "Shortcut<indent>"
};
const p = [r, s];
export {
  p as indent,
  r as indentConfig,
  s as indentPlugin
};
//# sourceMappingURL=index.es.js.map
