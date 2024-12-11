import { createCmdKey as O, commandsTimerCtx as I, CommandsReady as R, commandsCtx as d, editorStateTimerCtx as A, SchemaReady as l, inputRulesCtx as C, schemaCtx as g, schemaTimerCtx as E, marksCtx as w, nodesCtx as k, prosePluginsCtx as p, editorViewTimerCtx as D, nodeViewCtx as v, markViewCtx as $, InitReady as N, remarkPluginsCtx as b, editorViewCtx as f, serializerCtx as H, parserCtx as M, editorStateOptionsCtx as L } from "@milkdown/core";
import { createTimer as F, createSlice as U } from "@milkdown/ctx";
import { customAlphabet as q } from "nanoid";
import { missingMarkInSchema as P, missingNodeInSchema as j } from "@milkdown/exception";
import { keymap as z } from "@milkdown/prose/keymap";
import { NodeType as T, DOMSerializer as B, Slice as K } from "@milkdown/prose/model";
import { EditorState as G } from "@milkdown/prose/state";
const J = q("abcedfghicklmn", 10);
function y(n, o, r) {
  const t = F(r || J());
  let e = !1;
  const a = (s) => (s.record(t), s.update(o, (i) => i.concat(t)), async () => {
    const u = await n(s, a, () => {
      s.done(t), e = !0;
    });
    return e || s.done(t), () => {
      s.update(o, (c) => c.filter((m) => m !== t)), s.clearTimer(t), u == null || u();
    };
  });
  return a.timer = t, a;
}
function re(n, o) {
  const r = O(n), t = (e) => async () => {
    t.key = r, await e.wait(R);
    const a = o(e);
    return e.get(d).create(r, a), t.run = (s) => e.get(d).call(n, s), () => {
      e.get(d).remove(r);
    };
  };
  return t;
}
function ae(n, o, r) {
  const t = O(n);
  return y(
    async (e, a) => {
      await e.wait(R);
      const s = await o(e);
      return e.get(d).create(t, s), a.run = (i) => e.get(d).call(n, i), a.key = t, () => {
        e.get(d).remove(t);
      };
    },
    I,
    r
  );
}
function oe(n) {
  const o = (r) => async () => {
    await r.wait(l);
    const t = n(r);
    return r.update(C, (e) => [...e, t]), o.inputRule = t, () => {
      r.update(C, (e) => e.filter((a) => a !== t));
    };
  };
  return o;
}
function se(n, o) {
  return y(
    async (r, t) => {
      await r.wait(l);
      const e = await n(r);
      return r.update(C, (a) => [...a, e]), t.inputRule = e, () => {
        r.update(C, (a) => a.filter((s) => s !== e));
      };
    },
    A,
    o
  );
}
function Q(n, o) {
  const r = (t) => async () => {
    const e = o(t);
    return t.update(w, (a) => [...a.filter((s) => s[0] !== n), [n, e]]), r.id = n, r.schema = e, () => {
      t.update(w, (a) => a.filter(([s]) => s !== n));
    };
  };
  return r.type = (t) => {
    const e = t.get(g).marks[n];
    if (!e)
      throw P(n);
    return e;
  }, r;
}
function ie(n, o, r) {
  const t = y(
    async (e, a, s) => {
      const i = await o(e);
      return e.update(w, (u) => [...u.filter((c) => c[0] !== n), [n, i]]), a.id = n, a.schema = i, s(), () => {
        e.update(w, (u) => u.filter(([c]) => c !== n));
      };
    },
    E,
    r
  );
  return t.type = (e) => {
    const a = e.get(g).marks[n];
    if (!a)
      throw P(n);
    return a;
  }, t;
}
function W(n, o) {
  const r = (t) => async () => {
    const e = o(t);
    return t.update(k, (a) => [...a.filter((s) => s[0] !== n), [n, e]]), r.id = n, r.schema = e, () => {
      t.update(k, (a) => a.filter(([s]) => s !== n));
    };
  };
  return r.type = (t) => {
    const e = t.get(g).nodes[n];
    if (!e)
      throw j(n);
    return e;
  }, r;
}
function ce(n, o, r) {
  const t = y(
    async (e, a, s) => {
      const i = await o(e);
      return e.update(k, (u) => [...u.filter((c) => c[0] !== n), [n, i]]), a.id = n, a.schema = i, s(), () => {
        e.update(k, (u) => u.filter(([c]) => c !== n));
      };
    },
    E,
    r
  );
  return t.type = (e) => {
    const a = e.get(g).nodes[n];
    if (!a)
      throw j(n);
    return a;
  }, t;
}
function ue(n) {
  let o;
  const r = (t) => async () => (await t.wait(l), o = n(t), t.update(p, (e) => [...e, o]), () => {
    t.update(p, (e) => e.filter((a) => a !== o));
  });
  return r.plugin = () => o, r.key = () => o.spec.key, r;
}
function me(n, o) {
  let r;
  const t = y(
    async (e) => (await e.wait(l), r = await n(e), e.update(p, (a) => [...a, r]), () => {
      e.update(p, (a) => a.filter((s) => s !== r));
    }),
    A,
    o
  );
  return t.plugin = () => r, t.key = () => r.spec.key, t;
}
function X(n) {
  const o = (r) => async () => {
    await r.wait(l);
    const t = n(r), e = z(t);
    return r.update(p, (a) => [...a, e]), o.keymap = t, () => {
      r.update(p, (a) => a.filter((s) => s !== e));
    };
  };
  return o;
}
function pe(n, o) {
  return y(
    async (r, t) => {
      await r.wait(l);
      const e = await n(r), a = z(e);
      return r.update(p, (s) => [...s, a]), t.keymap = e, () => {
        r.update(p, (s) => s.filter((i) => i !== a));
      };
    },
    A,
    o
  );
}
function le(n, o) {
  const r = (t) => async () => {
    await t.wait(l);
    const e = o(t);
    return n.type(t) instanceof T ? t.update(v, (a) => [...a, [n.id, e]]) : t.update($, (a) => [...a, [n.id, e]]), r.view = e, r.type = n, () => {
      n.type(t) instanceof T ? t.update(v, (a) => a.filter((s) => s[0] !== n.id)) : t.update($, (a) => a.filter((s) => s[0] !== n.id));
    };
  };
  return r;
}
function de(n, o, r) {
  return y(
    async (t, e) => {
      await t.wait(l);
      const a = await o(t);
      return n.type(t) instanceof T ? t.update(v, (s) => [...s, [n.id, a]]) : t.update($, (s) => [...s, [n.id, a]]), e.view = a, e.type = n, () => {
        n.type(t) instanceof T ? t.update(v, (s) => s.filter((i) => i[0] !== n.id)) : t.update($, (s) => s.filter((i) => i[0] !== n.id));
      };
    },
    D,
    r
  );
}
function h(n, o) {
  const r = U(n, o), t = (e) => (e.inject(r), () => () => {
    e.remove(r);
  });
  return t.key = r, t;
}
function fe(n, o) {
  const r = h(o, n), t = W(n, (a) => a.get(r.key)(a)), e = [r, t];
  return e.id = t.id, e.node = t, e.type = (a) => t.type(a), e.schema = t.schema, e.ctx = r, e.key = r.key, e.extendSchema = (a) => (s) => () => {
    const i = s.get(r.key), c = a(i)(s);
    s.update(k, (m) => [...m.filter((S) => S[0] !== n), [n, c]]), e.schema = c;
  }, e;
}
function ye(n, o) {
  const r = h(o, n), t = Q(n, (a) => a.get(r.key)(a)), e = [r, t];
  return e.id = t.id, e.mark = t, e.type = t.type, e.schema = t.schema, e.ctx = r, e.key = r.key, e.extendSchema = (a) => (s) => () => {
    const i = s.get(r.key), c = a(i)(s);
    s.update(w, (m) => [...m.filter((S) => S[0] !== n), [n, c]]), e.schema = c;
  }, e;
}
function ge(n, o) {
  const r = Object.fromEntries(Object.entries(o).map(([s, { shortcuts: i }]) => [s, i])), t = h(r, `${n}Keymap`), e = X((s) => {
    const i = s.get(t.key), u = Object.entries(o).flatMap(([c, { command: m }]) => [i[c]].flat().map((V) => [V, m(s)]));
    return Object.fromEntries(u);
  }), a = [t, e];
  return a.ctx = t, a.shortcuts = e, a.key = t.key, a.keymap = e.keymap, a;
}
const he = (n, o = () => ({})) => h(o, `${n}Attr`), we = (n, o = () => ({})) => h(o, `${n}Attr`);
function ke(n, o, r) {
  const t = h(r ?? {}, n), e = (s) => async () => {
    await s.wait(N);
    const u = {
      plugin: o(s),
      options: s.get(t.key)
    };
    return s.update(b, (c) => [...c, u]), () => {
      s.update(b, (c) => c.filter((m) => m !== u));
    };
  }, a = [t, e];
  return a.id = n, a.plugin = e, a.options = t, a;
}
function Se(n, o) {
  return (r) => r.get(d).call(n, o);
}
function Ce() {
  return (n) => {
    const o = n.get(f), { tr: r } = o.state, t = Object.assign(Object.create(r), r).setTime(Date.now());
    return o.dispatch(t);
  };
}
function ve() {
  return (n) => {
    const o = document.createElement("div"), r = n.get(g), t = n.get(f), e = B.fromSchema(r).serializeFragment(t.state.doc.content);
    return o.appendChild(e), o.innerHTML;
  };
}
function $e() {
  return (n) => {
    const o = n.get(f);
    return n.get(H)(o.state.doc);
  };
}
function Te(n) {
  return (o) => {
    const r = o.get(f), e = o.get(M)(n);
    if (!e)
      return;
    const a = r.state.selection.content();
    return r.dispatch(
      r.state.tr.replaceSelection(new K(e.content, a.openStart, a.openEnd)).scrollIntoView()
    );
  };
}
function Ae() {
  return (n) => {
    const o = n.get(f), r = [];
    return o.state.doc.descendants((e) => {
      e.type.name === "heading" && e.attrs.level && r.push({ text: e.textContent, level: e.attrs.level, id: e.attrs.id });
    }), r;
  };
}
function be(n, o = !1) {
  return (r) => {
    const t = r.get(f), a = r.get(M)(n);
    if (!a)
      return;
    if (!o) {
      const { state: m } = t;
      return t.dispatch(m.tr.replace(0, m.doc.content.size, new K(a.content, 0, 0)));
    }
    const s = r.get(g), i = r.get(L), u = r.get(p), c = G.create({
      schema: s,
      doc: a,
      plugins: u,
      ...i
    });
    t.updateState(c);
  };
}
function Oe(n, o) {
  return (r) => {
    const t = r.get(f), { tr: e } = t.state, a = e.doc.nodeAt(n);
    if (!a)
      return;
    const s = o(a.attrs);
    return t.dispatch(e.setNodeMarkup(n, void 0, s));
  };
}
const Re = (...n) => {
  const o = n.length;
  let r = o;
  for (; r--; )
    if (typeof n[r] != "function")
      throw new TypeError("Expected a function");
  return (...t) => {
    let e = 0, a = o ? n[e](...t) : t[0];
    for (; ++e < o; )
      a = n[e](a);
    return a;
  };
};
export {
  re as $command,
  ae as $commandAsync,
  h as $ctx,
  oe as $inputRule,
  se as $inputRuleAsync,
  Q as $mark,
  ie as $markAsync,
  we as $markAttr,
  ye as $markSchema,
  W as $node,
  ce as $nodeAsync,
  he as $nodeAttr,
  fe as $nodeSchema,
  ue as $prose,
  me as $proseAsync,
  ke as $remark,
  X as $shortcut,
  pe as $shortcutAsync,
  ge as $useKeymap,
  le as $view,
  de as $viewAsync,
  y as addTimer,
  Se as callCommand,
  Ce as forceUpdate,
  ve as getHTML,
  $e as getMarkdown,
  Te as insert,
  J as nanoid,
  Ae as outline,
  Re as pipe,
  be as replaceAll,
  Oe as setAttr
};
//# sourceMappingURL=index.es.js.map
