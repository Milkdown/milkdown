var H = (p) => {
  throw TypeError(p);
};
var K = (p, h, n) => h.has(p) || H("Cannot " + n);
var i = (p, h, n) => (K(p, h, "read from private field"), n ? n.call(p) : h.get(p)), u = (p, h, n) => h.has(p) ? H("Cannot add the same private member more than once") : h instanceof WeakSet ? h.add(p) : h.set(p, n), o = (p, h, n, t) => (K(p, h, "write to private field"), t ? t.call(p, n) : h.set(p, n), n);
import { stackOverFlow as U, parserMatchError as Y, createNodeInParserFail as Z, serializerMatchError as _ } from "@milkdown/exception";
import { Mark as J } from "@milkdown/prose/model";
class V {
}
class X {
  constructor() {
    this.elements = [], this.size = () => this.elements.length, this.top = () => this.elements.at(-1), this.push = (h) => {
      var n;
      (n = this.top()) == null || n.push(h);
    }, this.open = (h) => {
      this.elements.push(h);
    }, this.close = () => {
      const h = this.elements.pop();
      if (!h) throw U();
      return h;
    };
  }
}
class B extends V {
  constructor(h, n, t) {
    super(), this.type = h, this.content = n, this.attrs = t;
  }
  push(h, ...n) {
    this.content.push(h, ...n);
  }
  pop() {
    return this.content.pop();
  }
  static create(h, n, t) {
    return new B(h, n, t);
  }
}
var d, M, O, T, F, w, g;
const $ = class $ extends X {
  /// @internal
  constructor(n) {
    super();
    u(this, d);
    u(this, M);
    u(this, O);
    u(this, T);
    u(this, F);
    u(this, w);
    u(this, g);
    o(this, d, J.none), o(this, M, (t) => t.isText), o(this, O, (t, s) => {
      if (i(this, M).call(this, t) && i(this, M).call(this, s) && J.sameSet(t.marks, s.marks))
        return this.schema.text(t.text + s.text, t.marks);
    }), o(this, T, (t) => {
      const s = Object.values({
        ...this.schema.nodes,
        ...this.schema.marks
      }).find((e) => e.spec.parseMarkdown.match(t));
      if (!s) throw Y(t);
      return s;
    }), o(this, F, (t) => {
      const s = i(this, T).call(this, t);
      s.spec.parseMarkdown.runner(this, t, s);
    }), this.injectRoot = (t, s, e) => (this.openNode(s, e), this.next(t.children), this), this.openNode = (t, s) => (this.open(B.create(t, [], s)), this), o(this, w, () => {
      o(this, d, J.none);
      const t = this.close();
      return i(this, g).call(this, t.type, t.attrs, t.content);
    }), this.closeNode = () => (i(this, w).call(this), this), o(this, g, (t, s, e) => {
      const r = t.createAndFill(s, e, i(this, d));
      if (!r) throw Z(t, s, e);
      return this.push(r), r;
    }), this.addNode = (t, s, e) => (i(this, g).call(this, t, s, e), this), this.openMark = (t, s) => {
      const e = t.create(s);
      return o(this, d, e.addToSet(i(this, d))), this;
    }, this.closeMark = (t) => (o(this, d, t.removeFromSet(i(this, d))), this), this.addText = (t) => {
      const s = this.top();
      if (!s) throw U();
      const e = s.pop(), r = this.schema.text(t, i(this, d));
      if (!e)
        return s.push(r), this;
      const a = i(this, O).call(this, e, r);
      return a ? (s.push(a), this) : (s.push(e, r), this);
    }, this.build = () => {
      let t;
      do
        t = i(this, w).call(this);
      while (this.size());
      return t;
    }, this.next = (t = []) => ([t].flat().forEach((s) => i(this, F).call(this, s)), this), this.toDoc = () => this.build(), this.run = (t, s) => {
      const e = t.runSync(
        t.parse(s),
        s
      );
      return this.next(e), this;
    }, this.schema = n;
  }
};
d = new WeakMap(), M = new WeakMap(), O = new WeakMap(), T = new WeakMap(), F = new WeakMap(), w = new WeakMap(), g = new WeakMap(), $.create = (n, t) => {
  const s = new $(n);
  return (e) => (s.run(t, e), s.toDoc());
};
let L = $;
const q = class q extends V {
  constructor(h, n, t, s = {}) {
    super(), this.type = h, this.children = n, this.value = t, this.props = s, this.push = (e, ...r) => {
      this.children || (this.children = []), this.children.push(e, ...r);
    }, this.pop = () => {
      var e;
      return (e = this.children) == null ? void 0 : e.pop();
    };
  }
};
q.create = (h, n, t, s = {}) => new q(h, n, t, s);
let W = q;
const tt = (p) => Object.prototype.hasOwnProperty.call(p, "size");
var v, P, A, S, I, j, b, C, R, x, N, D, E;
const z = class z extends X {
  /// @internal
  constructor(n) {
    super();
    u(this, v);
    u(this, P);
    u(this, A);
    u(this, S);
    u(this, I);
    u(this, j);
    u(this, b);
    u(this, C);
    u(this, R);
    u(this, x);
    u(this, N);
    u(this, D);
    u(this, E);
    o(this, v, J.none), o(this, P, (t) => {
      const s = Object.values({
        ...this.schema.nodes,
        ...this.schema.marks
      }).find((e) => e.spec.toMarkdown.match(t));
      if (!s) throw _(t.type);
      return s;
    }), o(this, A, (t) => i(this, P).call(this, t).spec.toMarkdown.runner(this, t)), o(this, S, (t, s) => i(this, P).call(this, t).spec.toMarkdown.runner(this, t, s)), o(this, I, (t) => {
      const { marks: s } = t, e = (c) => c.type.spec.priority ?? 50;
      [...s].sort((c, f) => e(c) - e(f)).every((c) => !i(this, S).call(this, c, t)) && i(this, A).call(this, t), s.forEach((c) => i(this, E).call(this, c));
    }), o(this, j, (t, s) => {
      var f;
      if (t.type === s || ((f = t.children) == null ? void 0 : f.length) !== 1) return t;
      const e = (y) => {
        var l;
        if (y.type === s) return y;
        if (((l = y.children) == null ? void 0 : l.length) !== 1) return null;
        const [k] = y.children;
        return k ? e(k) : null;
      }, r = e(t);
      if (!r) return t;
      const a = r.children ? [...r.children] : void 0, c = { ...t, children: a };
      return c.children = a, r.children = [c], r;
    }), o(this, b, (t) => {
      const { children: s } = t;
      return s && (t.children = s.reduce((e, r, a) => {
        if (a === 0) return [r];
        const c = e.at(-1);
        if (c && c.isMark && r.isMark) {
          r = i(this, j).call(this, r, c.type);
          const { children: f, ...y } = r, { children: k, ...l } = c;
          if (r.type === c.type && f && k && JSON.stringify(y) === JSON.stringify(l)) {
            const m = {
              ...l,
              children: [...k, ...f]
            };
            return e.slice(0, -1).concat(i(this, b).call(this, m));
          }
        }
        return e.concat(r);
      }, [])), t;
    }), o(this, C, (t) => {
      const s = {
        ...t.props,
        type: t.type
      };
      return t.children && (s.children = t.children), t.value && (s.value = t.value), s;
    }), this.openNode = (t, s, e) => (this.open(W.create(t, void 0, s, e)), this), o(this, R, (t, s) => {
      let e = "", r = "";
      const a = t.children;
      let c = -1, f = -1;
      const y = (l) => {
        l && l.forEach((m, G) => {
          m.type === "text" && m.value && (c < 0 && (c = G), f = G);
        });
      };
      if (a) {
        y(a);
        const l = a == null ? void 0 : a[f], m = a == null ? void 0 : a[c];
        l && l.value.endsWith(" ") && (r = l.value.match(/ +$/)[0], l.value = l.value.trimEnd()), m && m.value.startsWith(" ") && (e = m.value.match(/^ +/)[0], m.value = m.value.trimStart());
      }
      e.length && i(this, N).call(this, "text", void 0, e);
      const k = s();
      return r.length && i(this, N).call(this, "text", void 0, r), k;
    }), o(this, x, (t = !1) => {
      const s = this.close(), e = () => i(this, N).call(this, s.type, s.children, s.value, s.props);
      return t ? i(this, R).call(this, s, e) : e();
    }), this.closeNode = () => (i(this, x).call(this), this), o(this, N, (t, s, e, r) => {
      const a = W.create(t, s, e, r), c = i(this, b).call(this, i(this, C).call(this, a));
      return this.push(c), c;
    }), this.addNode = (t, s, e, r) => (i(this, N).call(this, t, s, e, r), this), o(this, D, (t, s, e, r) => t.isInSet(i(this, v)) ? this : (o(this, v, t.addToSet(i(this, v))), this.openNode(s, e, { ...r, isMark: !0 }))), o(this, E, (t) => {
      t.isInSet(i(this, v)) && (o(this, v, t.type.removeFromSet(i(this, v))), i(this, x).call(this, !0));
    }), this.withMark = (t, s, e, r) => (i(this, D).call(this, t, s, e, r), this), this.closeMark = (t) => (i(this, E).call(this, t), this), this.build = () => {
      let t = null;
      do
        t = i(this, x).call(this);
      while (this.size());
      return t;
    }, this.next = (t) => tt(t) ? (t.forEach((s) => {
      i(this, I).call(this, s);
    }), this) : (i(this, I).call(this, t), this), this.toString = (t) => t.stringify(this.build()), this.run = (t) => (this.next(t), this), this.schema = n;
  }
};
v = new WeakMap(), P = new WeakMap(), A = new WeakMap(), S = new WeakMap(), I = new WeakMap(), j = new WeakMap(), b = new WeakMap(), C = new WeakMap(), R = new WeakMap(), x = new WeakMap(), N = new WeakMap(), D = new WeakMap(), E = new WeakMap(), z.create = (n, t) => {
  const s = new z(n);
  return (e) => (s.run(e), s.toString(t));
};
let Q = z;
export {
  L as ParserState,
  Q as SerializerState,
  X as Stack,
  V as StackElement
};
//# sourceMappingURL=index.es.js.map
