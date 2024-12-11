import { commandsCtx as a } from "@milkdown/core";
import { undo as y, redo as c, history as h } from "@milkdown/prose/history";
import { $command as d, $ctx as p, $prose as l, $useKeymap as u } from "@milkdown/utils";
function t(o, r) {
  return Object.assign(o, {
    meta: {
      package: "@milkdown/plugin-history",
      ...r
    }
  }), o;
}
const s = d("Undo", () => () => y);
t(s, {
  displayName: "Command<undo>"
});
const m = d("Redo", () => () => c);
t(m, {
  displayName: "Command<redo>"
});
const e = p({}, "historyProviderConfig");
t(e, {
  displayName: "Ctx<historyProviderConfig>"
});
const n = l((o) => h(o.get(e.key)));
t(n, {
  displayName: "Ctx<historyProviderPlugin>"
});
const i = u("historyKeymap", {
  Undo: {
    shortcuts: "Mod-z",
    command: (o) => {
      const r = o.get(a);
      return () => r.call(s.key);
    }
  },
  Redo: {
    shortcuts: ["Mod-y", "Shift-Mod-z"],
    command: (o) => {
      const r = o.get(a);
      return () => r.call(m.key);
    }
  }
});
t(i.ctx, {
  displayName: "KeymapCtx<history>"
});
t(i.shortcuts, {
  displayName: "Keymap<history>"
});
const x = [e, n, i, s, m].flat();
export {
  x as history,
  i as historyKeymap,
  e as historyProviderConfig,
  n as historyProviderPlugin,
  m as redoCommand,
  s as undoCommand
};
//# sourceMappingURL=index.es.js.map
