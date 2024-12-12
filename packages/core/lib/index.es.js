var ve = (e) => {
  throw TypeError(e);
};
var ke = (e, t, r) => t.has(e) || ve("Cannot " + r);
var s = (e, t, r) => (ke(e, t, "read from private field"), r ? r.call(e) : t.get(e)), d = (e, t, r) => t.has(e) ? ve("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), c = (e, t, r, i) => (ke(e, t, "write to private field"), i ? i.call(e, r) : t.set(e, r), r);
import { createSlice as o, createTimer as v, Container as Pe, Clock as Ye, Ctx as $e } from "@milkdown/ctx";
import { Schema as qe, DOMParser as He, Node as Je } from "@milkdown/prose/model";
import de from "remark-parse";
import he from "remark-stringify";
import { unified as le } from "unified";
import { callCommandBeforeEditorView as Fe, ctxCallOutOfScope as Re, docTypeError as Ge } from "@milkdown/exception";
import { ParserState as Qe, SerializerState as Ue } from "@milkdown/transformer";
import { customInputRules as Xe } from "@milkdown/prose";
import { chainCommands as Ze, deleteSelection as xe, joinBackward as et, selectNodeBackward as tt, baseKeymap as rt } from "@milkdown/prose/commands";
import { undoInputRule as st } from "@milkdown/prose/inputrules";
import { keymap as it } from "@milkdown/prose/keymap";
import { PluginKey as be, Plugin as De, EditorState as nt } from "@milkdown/prose/state";
import { EditorView as ot } from "@milkdown/prose/view";
function k(e, t) {
  return e.meta = {
    package: "@milkdown/core",
    group: "System",
    ...t
  }, e;
}
const Ee = {
  strong: (e, t, r, i) => {
    const n = e.marker || r.options.strong || "*", a = r.enter("strong"), h = r.createTracker(i);
    let m = h.move(n + n);
    return m += h.move(
      r.containerPhrasing(e, {
        before: m,
        after: n,
        ...h.current()
      })
    ), m += h.move(n + n), a(), m;
  },
  emphasis: (e, t, r, i) => {
    const n = e.marker || r.options.emphasis || "*", a = r.enter("emphasis"), h = r.createTracker(i);
    let m = h.move(n);
    return m += h.move(
      r.containerPhrasing(e, {
        before: m,
        after: n,
        ...h.current()
      })
    ), m += h.move(n), a(), m;
  }
}, L = o({}, "editorView"), V = o({}, "editorState"), G = o([], "initTimer"), Te = o({}, "editor"), ue = o([], "inputRules"), N = o([], "prosePlugins"), pe = o(
  [],
  "remarkPlugins"
), fe = o([], "nodeView"), ye = o([], "markView"), P = o(
  le().use(de).use(he),
  "remark"
), Q = o(
  {
    handlers: Ee
  },
  "remarkStringifyOptions"
), W = v("ConfigReady");
function at(e) {
  const t = (r) => (r.record(W), async () => (await e(r), r.done(W), () => {
    r.clearTimer(W);
  }));
  return k(t, {
    displayName: "Config"
  }), t;
}
const M = v("InitReady");
function ct(e) {
  const t = (r) => (r.inject(Te, e).inject(N, []).inject(pe, []).inject(ue, []).inject(fe, []).inject(ye, []).inject(Q, {
    handlers: Ee
  }).inject(P, le().use(de).use(he)).inject(G, [W]).record(M), async () => {
    await r.waitTimers(G);
    const i = r.get(Q);
    return r.set(
      P,
      le().use(de).use(he, i)
    ), r.done(M), () => {
      r.remove(Te).remove(N).remove(pe).remove(ue).remove(fe).remove(ye).remove(Q).remove(P).remove(G).clearTimer(M);
    };
  });
  return k(t, {
    displayName: "Init"
  }), t;
}
const R = v("SchemaReady"), U = o([], "schemaTimer"), b = o({}, "schema"), X = o([], "nodes"), Z = o([], "marks");
function je(e) {
  var t;
  return {
    ...e,
    parseDOM: (t = e.parseDOM) == null ? void 0 : t.map((r) => ({ priority: e.priority, ...r }))
  };
}
const Ie = (e) => (e.inject(b, {}).inject(X, []).inject(Z, []).inject(U, [M]).record(R), async () => {
  await e.waitTimers(U);
  const t = e.get(P), i = e.get(pe).reduce(
    (m, f) => m.use(f.plugin, f.options),
    t
  );
  e.set(P, i);
  const n = Object.fromEntries(
    e.get(X).map(([m, f]) => [m, je(f)])
  ), a = Object.fromEntries(
    e.get(Z).map(([m, f]) => [m, je(f)])
  ), h = new qe({ nodes: n, marks: a });
  return e.set(b, h), e.done(R), () => {
    e.remove(b).remove(X).remove(Z).remove(U).clearTimer(R);
  };
});
k(Ie, {
  displayName: "Schema"
});
var T, g;
class Ve {
  constructor() {
    d(this, T);
    d(this, g);
    c(this, T, new Pe()), c(this, g, null), this.setCtx = (t) => {
      c(this, g, t);
    };
  }
  get ctx() {
    return s(this, g);
  }
  /// Register a command into the manager.
  create(t, r) {
    const i = t.create(s(this, T).sliceMap);
    return i.set(r), i;
  }
  get(t) {
    return s(this, T).get(t).get();
  }
  remove(t) {
    return s(this, T).remove(t);
  }
  call(t, r) {
    if (s(this, g) == null) throw Fe();
    const n = this.get(t)(r), a = s(this, g).get(L);
    return n(a.state, a.dispatch, a);
  }
}
T = new WeakMap(), g = new WeakMap();
function It(e = "cmdKey") {
  return o(() => () => !1, e);
}
const Oe = o(new Ve(), "commands"), x = o([R], "commandsTimer"), Y = v("CommandsReady"), Me = (e) => {
  const t = new Ve();
  return t.setCtx(e), e.inject(Oe, t).inject(x, [R]).record(Y), async () => (await e.waitTimers(x), e.done(Y), () => {
    e.remove(Oe).remove(x).clearTimer(Y);
  });
};
k(Me, {
  displayName: "Commands"
});
const $ = v("ParserReady"), Ne = () => {
  throw Re();
}, q = o(Ne, "parser"), ee = o([], "parserTimer"), _e = (e) => (e.inject(q, Ne).inject(ee, [R]).record($), async () => {
  await e.waitTimers(ee);
  const t = e.get(P), r = e.get(b);
  return e.set(q, Qe.create(r, t)), e.done($), () => {
    e.remove(q).remove(ee).clearTimer($);
  };
});
k(_e, {
  displayName: "Parser"
});
const H = v("SerializerReady"), te = o(
  [],
  "serializerTimer"
), ze = () => {
  throw Re();
}, re = o(
  ze,
  "serializer"
), Ke = (e) => (e.inject(re, ze).inject(te, [R]).record(H), async () => {
  await e.waitTimers(te);
  const t = e.get(P), r = e.get(b);
  return e.set(re, Ue.create(r, t)), e.done(H), () => {
    e.remove(re).remove(te).clearTimer(H);
  };
});
k(Ke, {
  displayName: "Serializer"
});
const se = o("", "defaultValue"), ie = o(
  (e) => e,
  "stateOptions"
), ne = o(
  [],
  "editorStateTimer"
), J = v("EditorStateReady");
function mt(e, t, r) {
  if (typeof e == "string") return t(e);
  if (e.type === "html")
    return He.fromSchema(r).parse(e.dom);
  if (e.type === "json")
    return Je.fromJSON(r, e.value);
  throw Ge(e);
}
const dt = new be("MILKDOWN_STATE_TRACKER");
function ht(e) {
  const t = Ze(
    st,
    xe,
    et,
    tt
  );
  return e.Backspace = t, e;
}
const Ae = (e) => (e.inject(se, "").inject(V, {}).inject(ie, (t) => t).inject(ne, [$, H, Y]).record(J), async () => {
  await e.waitTimers(ne);
  const t = e.get(b), r = e.get(q), i = e.get(ue), n = e.get(ie), a = e.get(N), h = e.get(se), m = mt(h, r, t), f = [
    ...a,
    new De({
      key: dt,
      state: {
        init: () => {
        },
        apply: (Le, F, yt, We) => {
          e.set(V, We);
        }
      }
    }),
    Xe({ rules: i }),
    it(ht(rt))
  ];
  e.set(N, f);
  const B = n({
    schema: t,
    doc: m,
    plugins: f
  }), l = nt.create(B);
  return e.set(V, l), e.done(J), () => {
    e.remove(se).remove(V).remove(ie).remove(ne).clearTimer(J);
  };
});
k(Ae, {
  displayName: "EditorState"
});
const oe = v("EditorViewReady"), ae = o(
  [],
  "editorViewTimer"
), ce = o(
  {},
  "editorViewOptions"
), me = o(null, "root"), we = o(null, "rootDOM"), ge = o(
  {},
  "rootAttrs"
);
function lt(e, t) {
  const r = document.createElement("div");
  r.className = "milkdown", e.appendChild(r), t.set(we, r);
  const i = t.get(ge);
  return Object.entries(i).forEach(
    ([n, a]) => r.setAttribute(n, a)
  ), r;
}
function ut(e) {
  e.classList.add("editor"), e.setAttribute("role", "textbox");
}
const pt = new be("MILKDOWN_VIEW_CLEAR"), Be = (e) => (e.inject(me, document.body).inject(L, {}).inject(ce, {}).inject(we, null).inject(ge, {}).inject(ae, [J]).record(oe), async () => {
  await e.wait(M);
  const t = e.get(me) || document.body, r = typeof t == "string" ? document.querySelector(t) : t;
  e.update(N, (f) => [
    new De({
      key: pt,
      view: (B) => {
        const l = r ? lt(r, e) : void 0;
        return (() => {
          if (l && r) {
            const F = B.dom;
            r.replaceChild(l, F), l.appendChild(F);
          }
        })(), {
          destroy: () => {
            l != null && l.parentNode && (l == null || l.parentNode.replaceChild(B.dom, l)), l == null || l.remove();
          }
        };
      }
    }),
    ...f
  ]), await e.waitTimers(ae);
  const i = e.get(V), n = e.get(ce), a = Object.fromEntries(e.get(fe)), h = Object.fromEntries(e.get(ye)), m = new ot(r, {
    state: i,
    nodeViews: a,
    markViews: h,
    ...n
  });
  return ut(m.dom), e.set(L, m), e.done(oe), () => {
    m == null || m.destroy(), e.remove(me).remove(L).remove(ce).remove(we).remove(ge).remove(ae).clearTimer(oe);
  };
});
k(Be, {
  displayName: "EditorView"
});
var ft = /* @__PURE__ */ ((e) => (e.Idle = "Idle", e.OnCreate = "OnCreate", e.Created = "Created", e.OnDestroy = "OnDestroy", e.Destroyed = "Destroyed", e))(ft || {}), j, p, y, D, _, z, u, w, O, K, S, E, A, C, I;
const Ce = class Ce {
  constructor() {
    d(this, j);
    d(this, p);
    d(this, y);
    d(this, D);
    d(this, _);
    d(this, z);
    d(this, u);
    d(this, w);
    d(this, O);
    d(this, K);
    d(this, S);
    d(this, E);
    d(this, A);
    d(this, C);
    d(this, I);
    c(this, j, !1), c(this, p, "Idle"), c(this, y, []), c(this, D, () => {
    }), c(this, _, new Pe()), c(this, z, new Ye()), c(this, u, /* @__PURE__ */ new Map()), c(this, w, /* @__PURE__ */ new Map()), c(this, O, new $e(s(this, _), s(this, z))), c(this, K, () => {
      const t = at(async (i) => {
        await Promise.all(s(this, y).map((n) => n(i)));
      }), r = [
        Ie,
        _e,
        Ke,
        Me,
        Ae,
        Be,
        ct(this),
        t
      ];
      s(this, S).call(this, r, s(this, w));
    }), c(this, S, (t, r) => {
      t.forEach((i) => {
        const n = s(this, O).produce(
          s(this, j) ? i.meta : void 0
        ), a = i(n);
        r.set(i, { ctx: n, handler: a, cleanup: void 0 });
      });
    }), c(this, E, (t, r = !1) => Promise.all(
      [t].flat().map((i) => {
        const n = s(this, u).get(i), a = n == null ? void 0 : n.cleanup;
        return r ? s(this, u).delete(i) : s(this, u).set(i, {
          ctx: void 0,
          handler: void 0,
          cleanup: void 0
        }), typeof a == "function" ? a() : a;
      })
    )), c(this, A, async () => {
      await Promise.all(
        [...s(this, w).entries()].map(([t, { cleanup: r }]) => typeof r == "function" ? r() : r)
      ), s(this, w).clear();
    }), c(this, C, (t) => {
      c(this, p, t), s(this, D).call(this, t);
    }), c(this, I, (t) => [...t.entries()].map(async ([r, i]) => {
      const { ctx: n, handler: a } = i;
      if (!a) return;
      const h = await a();
      t.set(r, { ctx: n, handler: a, cleanup: h });
    })), this.enableInspector = (t = !0) => (c(this, j, t), this), this.onStatusChange = (t) => (c(this, D, t), this), this.config = (t) => (s(this, y).push(t), this), this.removeConfig = (t) => (c(this, y, s(this, y).filter((r) => r !== t)), this), this.use = (t) => {
      const r = [t].flat();
      return r.flat().forEach((i) => {
        s(this, u).set(i, {
          ctx: void 0,
          handler: void 0,
          cleanup: void 0
        });
      }), s(this, p) === "Created" && s(this, S).call(this, r, s(this, u)), this;
    }, this.remove = async (t) => s(this, p) === "OnCreate" ? (console.warn(
      "[Milkdown]: You are trying to remove plugins when the editor is creating, this is not recommended, please check your code."
    ), new Promise((r) => {
      setTimeout(() => {
        r(this.remove(t));
      }, 50);
    })) : (await s(this, E).call(this, [t].flat(), !0), this), this.create = async () => s(this, p) === "OnCreate" ? this : (s(this, p) === "Created" && await this.destroy(), s(this, C).call(this, "OnCreate"), s(this, K).call(this), s(this, S).call(this, [...s(this, u).keys()], s(this, u)), await Promise.all(
      [
        s(this, I).call(this, s(this, w)),
        s(this, I).call(this, s(this, u))
      ].flat()
    ), s(this, C).call(this, "Created"), this), this.destroy = async (t = !1) => s(this, p) === "Destroyed" || s(this, p) === "OnDestroy" ? this : s(this, p) === "OnCreate" ? new Promise((r) => {
      setTimeout(() => {
        r(this.destroy(t));
      }, 50);
    }) : (t && c(this, y, []), s(this, C).call(this, "OnDestroy"), await s(this, E).call(this, [...s(this, u).keys()], t), await s(this, A).call(this), s(this, C).call(this, "Destroyed"), this), this.action = (t) => t(s(this, O)), this.inspect = () => s(this, j) ? [...s(this, w).values(), ...s(this, u).values()].map(({ ctx: t }) => {
      var r;
      return (r = t == null ? void 0 : t.inspector) == null ? void 0 : r.read();
    }).filter((t) => !!t) : (console.warn(
      "[Milkdown]: You are trying to collect inspection when inspector is disabled, please enable inspector by `editor.enableInspector()` first."
    ), []);
  }
  /// Create a new editor instance.
  static make() {
    return new Ce();
  }
  /// Get the ctx of the editor.
  get ctx() {
    return s(this, O);
  }
  /// Get the status of the editor.
  get status() {
    return s(this, p);
  }
};
j = new WeakMap(), p = new WeakMap(), y = new WeakMap(), D = new WeakMap(), _ = new WeakMap(), z = new WeakMap(), u = new WeakMap(), w = new WeakMap(), O = new WeakMap(), K = new WeakMap(), S = new WeakMap(), E = new WeakMap(), A = new WeakMap(), C = new WeakMap(), I = new WeakMap();
let Se = Ce;
export {
  Ve as CommandManager,
  Y as CommandsReady,
  W as ConfigReady,
  Se as Editor,
  J as EditorStateReady,
  ft as EditorStatus,
  oe as EditorViewReady,
  M as InitReady,
  $ as ParserReady,
  R as SchemaReady,
  H as SerializerReady,
  Me as commands,
  Oe as commandsCtx,
  x as commandsTimerCtx,
  at as config,
  It as createCmdKey,
  se as defaultValueCtx,
  Te as editorCtx,
  Ae as editorState,
  V as editorStateCtx,
  ie as editorStateOptionsCtx,
  ne as editorStateTimerCtx,
  Be as editorView,
  L as editorViewCtx,
  ce as editorViewOptionsCtx,
  ae as editorViewTimerCtx,
  mt as getDoc,
  ct as init,
  G as initTimerCtx,
  ue as inputRulesCtx,
  ye as markViewCtx,
  Z as marksCtx,
  fe as nodeViewCtx,
  X as nodesCtx,
  _e as parser,
  q as parserCtx,
  ee as parserTimerCtx,
  N as prosePluginsCtx,
  P as remarkCtx,
  pe as remarkPluginsCtx,
  Q as remarkStringifyOptionsCtx,
  ge as rootAttrsCtx,
  me as rootCtx,
  we as rootDOMCtx,
  Ie as schema,
  b as schemaCtx,
  U as schemaTimerCtx,
  Ke as serializer,
  re as serializerCtx,
  te as serializerTimerCtx
};
//# sourceMappingURL=index.es.js.map
