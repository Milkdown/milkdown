import { dropCursor as e } from "@milkdown/prose/dropcursor";
import { gapCursor as i } from "@milkdown/prose/gapcursor";
import { $ctx as n, $prose as p } from "@milkdown/utils";
function o(r, a) {
  return Object.assign(r, {
    meta: {
      package: "@milkdown/plugin-cursor",
      ...a
    }
  }), r;
}
const s = n({}, "dropCursorConfig");
o(s, {
  displayName: "Ctx<dropCursor>"
});
const t = p((r) => e(r.get(s.key)));
o(t, {
  displayName: "Prose<dropCursor>"
});
const u = p(() => i());
o(u, {
  displayName: "Prose<gapCursor>"
});
const d = [s, t, u];
export {
  d as cursor,
  s as dropCursorConfig,
  t as dropCursorPlugin,
  u as gapCursorPlugin
};
//# sourceMappingURL=index.es.js.map
