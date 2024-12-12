var P = (o) => {
  throw TypeError(o);
};
var U = (o, s, i) => s.has(o) || P("Cannot " + i);
var e = (o, s, i) => (U(o, s, "read from private field"), i ? i.call(o) : s.get(o)), a = (o, s, i) => s.has(o) ? P("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(o) : s.set(o, i), n = (o, s, i, r) => (U(o, s, "write to private field"), r ? r.call(o, i) : s.set(o, i), i);
import { contextNotFound as F, ctxCallOutOfScope as N, timerNotFound as V } from "@milkdown/exception";
class H {
  constructor() {
    this.sliceMap = /* @__PURE__ */ new Map(), this.get = (s) => {
      const i = typeof s == "string" ? [...this.sliceMap.values()].find((r) => r.type.name === s) : this.sliceMap.get(s.id);
      if (!i) {
        const r = typeof s == "string" ? s : s.name;
        throw F(r);
      }
      return i;
    }, this.remove = (s) => {
      const i = typeof s == "string" ? [...this.sliceMap.values()].find((r) => r.type.name === s) : this.sliceMap.get(s.id);
      i && this.sliceMap.delete(i.type.id);
    }, this.has = (s) => typeof s == "string" ? [...this.sliceMap.values()].some((i) => i.type.name === s) : this.sliceMap.has(s.id);
  }
}
var u, m, y;
class W {
  /// @internal
  constructor(s, i, r) {
    a(this, u);
    /// @internal
    a(this, m);
    a(this, y);
    n(this, u, []), n(this, y, () => {
      e(this, u).forEach((t) => t(e(this, m)));
    }), this.set = (t) => {
      n(this, m, t), e(this, y).call(this);
    }, this.get = () => e(this, m), this.update = (t) => {
      n(this, m, t(e(this, m))), e(this, y).call(this);
    }, this.type = r, n(this, m, i), s.set(r.id, this);
  }
  /// Add a watcher for changes in the slice.
  /// Returns a function to remove the watcher.
  on(s) {
    return e(this, u).push(s), () => {
      n(this, u, e(this, u).filter((i) => i !== s));
    };
  }
  /// Add a one-time watcher for changes in the slice.
  /// The watcher will be removed after it is called.
  /// Returns a function to remove the watcher.
  once(s) {
    const i = this.on((r) => {
      s(r), i();
    });
    return i;
  }
  /// Remove a watcher.
  off(s) {
    n(this, u, e(this, u).filter((i) => i !== s));
  }
  /// Remove all watchers.
  offAll() {
    n(this, u, []);
  }
}
u = new WeakMap(), m = new WeakMap(), y = new WeakMap();
class _ {
  /// Create a slice type with a default value and a name.
  /// The name should be unique in the container.
  constructor(s, i) {
    this.id = Symbol(`Context-${i}`), this.name = i, this._defaultValue = s, this._typeInfo = () => {
      throw N();
    };
  }
  /// Create a slice with a container.
  /// You can also pass a value to override the default value.
  create(s, i = this._defaultValue) {
    return new W(s, i, this);
  }
}
const J = (o, s) => new _(o, s);
var D, x, R, w, S, f, M, T, j;
class q {
  /// Create an inspector with container, clock and metadata.
  constructor(s, i, r) {
    /// @internal
    a(this, D);
    /// @internal
    a(this, x);
    /// @internal
    a(this, R);
    a(this, w);
    a(this, S);
    a(this, f);
    a(this, M);
    a(this, T);
    a(this, j);
    n(this, w, /* @__PURE__ */ new Set()), n(this, S, /* @__PURE__ */ new Set()), n(this, f, /* @__PURE__ */ new Map()), n(this, M, /* @__PURE__ */ new Map()), this.read = () => ({
      metadata: e(this, D),
      injectedSlices: [...e(this, w)].map((t) => ({
        name: typeof t == "string" ? t : t.name,
        value: e(this, T).call(this, t)
      })),
      consumedSlices: [...e(this, S)].map((t) => ({
        name: typeof t == "string" ? t : t.name,
        value: e(this, T).call(this, t)
      })),
      recordedTimers: [...e(this, f)].map(
        ([t, { duration: h }]) => ({
          name: t.name,
          duration: h,
          status: e(this, j).call(this, t)
        })
      ),
      waitTimers: [...e(this, M)].map(([t, { duration: h }]) => ({
        name: t.name,
        duration: h,
        status: e(this, j).call(this, t)
      }))
    }), this.onRecord = (t) => {
      e(this, f).set(t, { start: Date.now(), duration: 0 });
    }, this.onClear = (t) => {
      e(this, f).delete(t);
    }, this.onDone = (t) => {
      const h = e(this, f).get(t);
      h && (h.duration = Date.now() - h.start);
    }, this.onWait = (t, h) => {
      const v = Date.now();
      h.finally(() => {
        e(this, M).set(t, { duration: Date.now() - v });
      });
    }, this.onInject = (t) => {
      e(this, w).add(t);
    }, this.onRemove = (t) => {
      e(this, w).delete(t);
    }, this.onUse = (t) => {
      e(this, S).add(t);
    }, n(this, T, (t) => e(this, x).get(t).get()), n(this, j, (t) => e(this, R).get(t).status), n(this, x, s), n(this, R, i), n(this, D, r);
  }
}
D = new WeakMap(), x = new WeakMap(), R = new WeakMap(), w = new WeakMap(), S = new WeakMap(), f = new WeakMap(), M = new WeakMap(), T = new WeakMap(), j = new WeakMap();
var d, l, b, c;
const L = class L {
  /// Create a ctx object with container and clock.
  constructor(s, i, r) {
    /// @internal
    a(this, d);
    /// @internal
    a(this, l);
    /// @internal
    a(this, b);
    /// @internal
    a(this, c);
    this.produce = (t) => t && Object.keys(t).length ? new L(e(this, d), e(this, l), { ...t }) : this, this.inject = (t, h) => {
      var O;
      const v = t.create(e(this, d).sliceMap);
      return h != null && v.set(h), (O = e(this, c)) == null || O.onInject(t), this;
    }, this.remove = (t) => {
      var h;
      return e(this, d).remove(t), (h = e(this, c)) == null || h.onRemove(t), this;
    }, this.record = (t) => {
      var h;
      return t.create(e(this, l).store), (h = e(this, c)) == null || h.onRecord(t), this;
    }, this.clearTimer = (t) => {
      var h;
      return e(this, l).remove(t), (h = e(this, c)) == null || h.onClear(t), this;
    }, this.isInjected = (t) => e(this, d).has(t), this.isRecorded = (t) => e(this, l).has(t), this.use = (t) => {
      var h;
      return (h = e(this, c)) == null || h.onUse(t), e(this, d).get(t);
    }, this.get = (t) => this.use(t).get(), this.set = (t, h) => this.use(t).set(h), this.update = (t, h) => this.use(t).update(h), this.timer = (t) => e(this, l).get(t), this.done = (t) => {
      var h;
      this.timer(t).done(), (h = e(this, c)) == null || h.onDone(t);
    }, this.wait = (t) => {
      var v;
      const h = this.timer(t).start();
      return (v = e(this, c)) == null || v.onWait(t, h), h;
    }, this.waitTimers = async (t) => {
      await Promise.all(this.get(t).map((h) => this.wait(h)));
    }, n(this, d, s), n(this, l, i), n(this, b, r), r && n(this, c, new q(s, i, r));
  }
  /// Get metadata of the ctx.
  get meta() {
    return e(this, b);
  }
  /// Get the inspector of the ctx.
  get inspector() {
    return e(this, c);
  }
};
d = new WeakMap(), l = new WeakMap(), b = new WeakMap(), c = new WeakMap();
let $ = L;
class K {
  constructor() {
    this.store = /* @__PURE__ */ new Map(), this.get = (s) => {
      const i = this.store.get(s.id);
      if (!i) throw V(s.name);
      return i;
    }, this.remove = (s) => {
      this.store.delete(s.id);
    }, this.has = (s) => this.store.has(s.id);
  }
}
var C, g, E, p, I, k;
class A {
  /// @internal
  constructor(s, i) {
    a(this, C);
    a(this, g);
    /// @internal
    a(this, E);
    a(this, p);
    a(this, I);
    a(this, k);
    n(this, C, null), n(this, g, null), n(this, p, "pending"), this.start = () => (e(this, C) ?? n(this, C, new Promise((r, t) => {
      n(this, g, (h) => {
        h instanceof CustomEvent && h.detail.id === e(this, E) && (n(this, p, "resolved"), e(this, I).call(this), h.stopImmediatePropagation(), r());
      }), e(this, k).call(this, () => {
        e(this, p) === "pending" && n(this, p, "rejected"), e(this, I).call(this), t(new Error(`Timing ${this.type.name} timeout.`));
      }), n(this, p, "pending"), addEventListener(this.type.name, e(this, g));
    })), e(this, C)), this.done = () => {
      const r = new CustomEvent(this.type.name, {
        detail: { id: e(this, E) }
      });
      dispatchEvent(r);
    }, n(this, I, () => {
      e(this, g) && removeEventListener(this.type.name, e(this, g));
    }), n(this, k, (r) => {
      setTimeout(() => {
        r();
      }, this.type.timeout);
    }), n(this, E, Symbol(i.name)), this.type = i, s.set(i.id, this);
  }
  /// The status of the timer.
  /// Can be `pending`, `resolved` or `rejected`.
  get status() {
    return e(this, p);
  }
}
C = new WeakMap(), g = new WeakMap(), E = new WeakMap(), p = new WeakMap(), I = new WeakMap(), k = new WeakMap();
class z {
  /// Create a timer type with a name and a timeout.
  /// The name should be unique in the clock.
  constructor(s, i = 3e3) {
    this.create = (r) => new A(r, this), this.id = Symbol(`Timer-${s}`), this.name = s, this.timeout = i;
  }
}
const Q = (o, s = 3e3) => new z(o, s);
export {
  K as Clock,
  H as Container,
  $ as Ctx,
  q as Inspector,
  W as Slice,
  _ as SliceType,
  A as Timer,
  z as TimerType,
  J as createSlice,
  Q as createTimer
};
//# sourceMappingURL=index.es.js.map
