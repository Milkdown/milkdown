import { expectDomTypeError as K } from "@milkdown/exception";
import { paragraphSchema as De, listItemSchema as Ee } from "@milkdown/preset-commonmark";
import { InputRule as ne } from "@milkdown/prose/inputrules";
import { $markAttr as Oe, $markSchema as He, $command as g, $inputRule as F, $useKeymap as le, $nodeSchema as C, $prose as v, $remark as Be } from "@milkdown/utils";
import { tableNodes as Le, TableMap as h, CellSelection as k, goToNextCell as re, isInTable as G, deleteTable as Ke, deleteColumn as Fe, deleteRow as Ge, addColumnBefore as We, addColumnAfter as ze, selectedRect as ae, setCellAttr as je, columnResizing as Ve, tableEditing as Ue } from "@milkdown/prose/tables";
import { commandsCtx as A } from "@milkdown/core";
import { toggleMark as Xe } from "@milkdown/prose/commands";
import { markRule as qe, findParentNodeClosestToPos as se, cloneTr as _, findParentNodeType as Je } from "@milkdown/prose";
import { Selection as ce, TextSelection as Qe, PluginKey as Ye, Plugin as Ze } from "@milkdown/prose/state";
import { imeSpan as et } from "prosemirror-safari-ime-span";
import tt from "remark-gfm";
function i(e, t) {
  return Object.assign(e, {
    meta: {
      package: "@milkdown/preset-gfm",
      ...t
    }
  }), e;
}
const W = Oe("strike_through");
i(W, {
  displayName: "Attr<strikethrough>",
  group: "Strikethrough"
});
const T = He("strike_through", (e) => ({
  parseDOM: [
    { tag: "del" },
    {
      style: "text-decoration",
      getAttrs: (t) => t === "line-through"
    }
  ],
  toDOM: (t) => ["del", e.get(W.key)(t)],
  parseMarkdown: {
    match: (t) => t.type === "delete",
    runner: (t, n, o) => {
      t.openMark(o), t.next(n.children), t.closeMark(o);
    }
  },
  toMarkdown: {
    match: (t) => t.type.name === "strike_through",
    runner: (t, n) => {
      t.withMark(n, "delete");
    }
  }
}));
i(T.mark, {
  displayName: "MarkSchema<strikethrough>",
  group: "Strikethrough"
});
i(T.ctx, {
  displayName: "MarkSchemaCtx<strikethrough>",
  group: "Strikethrough"
});
const z = g(
  "ToggleStrikeThrough",
  (e) => () => Xe(T.type(e))
);
i(z, {
  displayName: "Command<ToggleStrikethrough>",
  group: "Strikethrough"
});
const ie = F((e) => qe(/~([^~]+)~$/, T.type(e)));
i(ie, {
  displayName: "InputRule<strikethrough>",
  group: "Strikethrough"
});
const j = le("strikeThroughKeymap", {
  ToggleStrikethrough: {
    shortcuts: "Mod-Alt-x",
    command: (e) => {
      const t = e.get(A);
      return () => t.call(z.key);
    }
  }
});
i(j.ctx, {
  displayName: "KeymapCtx<strikethrough>",
  group: "Strikethrough"
});
i(j.shortcuts, {
  displayName: "Keymap<strikethrough>",
  group: "Strikethrough"
});
const S = Le({
  tableGroup: "block",
  cellContent: "paragraph",
  cellAttributes: {
    alignment: {
      default: "left",
      getFromDOM: (e) => e.style.textAlign || "left",
      setDOMAttr: (e, t) => {
        t.style = `text-align: ${e || "left"}`;
      }
    }
  }
}), N = C("table", () => ({
  ...S.table,
  content: "table_header_row table_row+",
  disableDropCursor: !0,
  parseMarkdown: {
    match: (e) => e.type === "table",
    runner: (e, t, n) => {
      const o = t.align, l = t.children.map((r, s) => ({
        ...r,
        align: o,
        isHeader: s === 0
      }));
      e.openNode(n), e.next(l), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table",
    runner: (e, t) => {
      var l;
      const n = (l = t.content.firstChild) == null ? void 0 : l.content;
      if (!n) return;
      const o = [];
      n.forEach((r) => {
        o.push(r.attrs.alignment);
      }), e.openNode("table", void 0, { align: o }), e.next(t.content), e.closeNode();
    }
  }
}));
i(N.node, {
  displayName: "NodeSchema<table>",
  group: "Table"
});
i(N.ctx, {
  displayName: "NodeSchemaCtx<table>",
  group: "Table"
});
const $ = C("table_header_row", () => ({
  ...S.table_row,
  disableDropCursor: !0,
  content: "(table_header)*",
  parseDOM: [{ tag: "tr[data-is-header]" }],
  toDOM() {
    return ["tr", { "data-is-header": !0 }, 0];
  },
  parseMarkdown: {
    match: (e) => !!(e.type === "tableRow" && e.isHeader),
    runner: (e, t, n) => {
      const o = t.align, l = t.children.map((r, s) => ({
        ...r,
        align: o[s],
        isHeader: t.isHeader
      }));
      e.openNode(n), e.next(l), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_header_row",
    runner: (e, t) => {
      e.openNode("tableRow", void 0, { isHeader: !0 }), e.next(t.content), e.closeNode();
    }
  }
}));
i($.node, {
  displayName: "NodeSchema<tableHeaderRow>",
  group: "Table"
});
i($.ctx, {
  displayName: "NodeSchemaCtx<tableHeaderRow>",
  group: "Table"
});
const R = C("table_row", () => ({
  ...S.table_row,
  disableDropCursor: !0,
  content: "(table_cell)*",
  parseMarkdown: {
    match: (e) => e.type === "tableRow",
    runner: (e, t, n) => {
      const o = t.align, l = t.children.map((r, s) => ({
        ...r,
        align: o[s]
      }));
      e.openNode(n), e.next(l), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_row",
    runner: (e, t) => {
      e.openNode("tableRow"), e.next(t.content), e.closeNode();
    }
  }
}));
i(R.node, {
  displayName: "NodeSchema<tableRow>",
  group: "Table"
});
i(R.ctx, {
  displayName: "NodeSchemaCtx<tableRow>",
  group: "Table"
});
const x = C("table_cell", () => ({
  ...S.table_cell,
  disableDropCursor: !0,
  parseMarkdown: {
    match: (e) => e.type === "tableCell" && !e.isHeader,
    runner: (e, t, n) => {
      const o = t.align;
      e.openNode(n, { alignment: o }).openNode(e.schema.nodes.paragraph).next(t.children).closeNode().closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_cell",
    runner: (e, t) => {
      e.openNode("tableCell").next(t.content).closeNode();
    }
  }
}));
i(x.node, {
  displayName: "NodeSchema<tableCell>",
  group: "Table"
});
i(x.ctx, {
  displayName: "NodeSchemaCtx<tableCell>",
  group: "Table"
});
const I = C("table_header", () => ({
  ...S.table_header,
  disableDropCursor: !0,
  parseMarkdown: {
    match: (e) => e.type === "tableCell" && !!e.isHeader,
    runner: (e, t, n) => {
      const o = t.align;
      e.openNode(n, { alignment: o }), e.openNode(e.schema.nodes.paragraph), e.next(t.children), e.closeNode(), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "table_header",
    runner: (e, t) => {
      e.openNode("tableCell"), e.next(t.content), e.closeNode();
    }
  }
}));
i(I.node, {
  displayName: "NodeSchema<tableHeader>",
  group: "Table"
});
i(I.ctx, {
  displayName: "NodeSchemaCtx<tableHeader>",
  group: "Table"
});
function de(e, t = 3, n = 3) {
  const o = Array(n).fill(0).map(() => x.type(e).createAndFill()), l = Array(n).fill(0).map(() => I.type(e).createAndFill()), r = Array(t).fill(0).map(
    (s, c) => c === 0 ? $.type(e).create(null, l) : R.type(e).create(null, o)
  );
  return N.type(e).create(null, r);
}
function M(e) {
  return se(
    (t) => t.type.spec.tableRole === "table"
  )(e);
}
function y(e, t) {
  const n = M(t.$from);
  if (!n) return;
  const o = h.get(n.node);
  if (!(e < 0 || e >= o.width))
    return o.cellsInRect({
      left: e,
      right: e + 1,
      top: 0,
      bottom: o.height
    }).map((l) => {
      const r = n.node.nodeAt(l);
      if (!r) return;
      const s = l + n.start;
      return {
        pos: s,
        start: s + 1,
        node: r
      };
    }).filter((l) => l != null);
}
function w(e, t) {
  const n = M(t.$from);
  if (!n) return;
  const o = h.get(n.node);
  if (!(e < 0 || e >= o.height))
    return o.cellsInRect({
      left: 0,
      right: o.width,
      top: e,
      bottom: e + 1
    }).map((l) => {
      const r = n.node.nodeAt(l);
      if (!r) return;
      const s = l + n.start;
      return {
        pos: s,
        start: s + 1,
        node: r
      };
    }).filter((l) => l != null);
}
function ot(e) {
  const t = M(e.$from);
  if (!t) return;
  const n = h.get(t.node);
  return n.cellsInRect({
    left: 0,
    right: n.width,
    top: 0,
    bottom: n.height
  }).map((l) => {
    const r = t.node.nodeAt(l), s = l + t.start;
    return { pos: s, start: s + 1, node: r };
  });
}
function nt(e) {
  const t = ot(e.selection);
  if (t && t[0]) {
    const n = e.doc.resolve(t[0].pos), o = t[t.length - 1];
    if (o) {
      const l = e.doc.resolve(o.pos);
      return _(e.setSelection(new k(l, n)));
    }
  }
  return e;
}
function me(e, t, { map: n, tableStart: o, table: l }, r) {
  const s = Array(r).fill(0).reduce((d, p, a) => d + l.child(a).nodeSize, o), c = Array(n.width).fill(0).map((d, p) => {
    const a = l.nodeAt(n.map[p]);
    return x.type(e).createAndFill({ alignment: a == null ? void 0 : a.attrs.alignment });
  });
  return t.insert(s, R.type(e).create(null, c)), t;
}
function ue(e) {
  return (t, n) => (o) => {
    n = n ?? o.selection.from;
    const l = o.doc.resolve(n), r = se(
      (d) => d.type.name === "table"
    )(l), s = r ? {
      node: r.node,
      from: r.start
    } : void 0, c = e === "row";
    if (s) {
      const d = h.get(s.node);
      if (t >= 0 && t < (c ? d.height : d.width)) {
        const p = d.positionAt(
          c ? t : d.height - 1,
          c ? d.width - 1 : t,
          s.node
        ), a = o.doc.resolve(s.from + p), m = c ? k.rowSelection : k.colSelection, u = d.positionAt(
          c ? t : 0,
          c ? 0 : t,
          s.node
        ), f = o.doc.resolve(s.from + u);
        return _(
          o.setSelection(
            m(a, f)
          )
        );
      }
    }
    return o;
  };
}
const lt = ue("row"), rt = ue("col");
function Z(e) {
  return e[0].map((t, n) => e.map((o) => o[n]));
}
function pe(e, t) {
  const n = [], o = h.get(e);
  for (let r = 0; r < o.height; r++) {
    const s = e.child(r), c = [];
    for (let d = 0; d < o.width; d++) {
      if (!t[r][d]) continue;
      const p = o.map[r * o.width + d], a = t[r][d], u = e.nodeAt(p).type.createChecked(
        Object.assign({}, a.attrs),
        a.content,
        a.marks
      );
      c.push(u);
    }
    n.push(s.type.createChecked(s.attrs, c, s.marks));
  }
  return e.type.createChecked(
    e.attrs,
    n,
    e.marks
  );
}
function fe(e) {
  const t = h.get(e), n = [];
  for (let o = 0; o < t.height; o++) {
    const l = [], r = {};
    for (let s = 0; s < t.width; s++) {
      const c = t.map[o * t.width + s], d = e.nodeAt(c), p = t.findCell(c);
      if (r[c] || p.top !== o) {
        l.push(null);
        continue;
      }
      r[c] = !0, l.push(d);
    }
    n.push(l);
  }
  return n;
}
function ge(e, t, n, o) {
  const l = t[0] > n[0] ? -1 : 1, r = e.splice(t[0], t.length), s = r.length % 2 === 0 ? 1 : 0;
  let c;
  return c = l === -1 ? n[0] : n[n.length - 1] - s, e.splice(c, 0, ...r), e;
}
function at(e, t, n, o) {
  let l = Z(fe(e.node));
  return l = ge(l, t, n), l = Z(l), pe(e.node, l);
}
function st(e, t, n, o) {
  let l = fe(e.node);
  return l = ge(l, t, n), pe(e.node, l);
}
function ee(e, t) {
  let n = e, o = e;
  for (let a = e; a >= 0; a--) {
    const m = y(a, t.selection);
    m && m.forEach((u) => {
      const f = u.node.attrs.colspan + a - 1;
      f >= n && (n = a), f > o && (o = f);
    });
  }
  for (let a = e; a <= o; a++) {
    const m = y(a, t.selection);
    m && m.forEach((u) => {
      const f = u.node.attrs.colspan + a - 1;
      u.node.attrs.colspan > 1 && f > o && (o = f);
    });
  }
  const l = [];
  for (let a = n; a <= o; a++) {
    const m = y(a, t.selection);
    m && m.length && l.push(a);
  }
  n = l[0], o = l[l.length - 1];
  const r = y(n, t.selection), s = w(0, t.selection), c = t.doc.resolve(
    r[r.length - 1].pos
  );
  let d;
  for (let a = o; a >= n; a--) {
    const m = y(a, t.selection);
    if (m && m.length) {
      for (let u = s.length - 1; u >= 0; u--)
        if (s[u].pos === m[0].pos) {
          d = m[0];
          break;
        }
      if (d) break;
    }
  }
  const p = t.doc.resolve(d.pos);
  return { $anchor: c, $head: p, indexes: l };
}
function te(e, t) {
  let n = e, o = e;
  for (let a = e; a >= 0; a--)
    w(a, t.selection).forEach((u) => {
      const f = u.node.attrs.rowspan + a - 1;
      f >= n && (n = a), f > o && (o = f);
    });
  for (let a = e; a <= o; a++)
    w(a, t.selection).forEach((u) => {
      const f = u.node.attrs.rowspan + a - 1;
      u.node.attrs.rowspan > 1 && f > o && (o = f);
    });
  const l = [];
  for (let a = n; a <= o; a++) {
    const m = w(a, t.selection);
    m && m.length && l.push(a);
  }
  n = l[0], o = l[l.length - 1];
  const r = w(n, t.selection), s = y(0, t.selection), c = t.doc.resolve(
    r[r.length - 1].pos
  );
  let d;
  for (let a = o; a >= n; a--) {
    const m = w(a, t.selection);
    if (m && m.length) {
      for (let u = s.length - 1; u >= 0; u--)
        if (s[u].pos === m[0].pos) {
          d = m[0];
          break;
        }
      if (d) break;
    }
  }
  const p = t.doc.resolve(d.pos);
  return { $anchor: c, $head: p, indexes: l };
}
function ct(e) {
  const { tr: t, origin: n, target: o, select: l = !0, pos: r } = e, s = r != null ? t.doc.resolve(r) : t.selection.$from, c = M(s);
  if (!c) return t;
  const { indexes: d } = ee(n, t), { indexes: p } = ee(o, t);
  if (d.includes(o)) return t;
  const a = at(
    c,
    d,
    p
  ), m = _(t).replaceWith(
    c.pos,
    c.pos + c.node.nodeSize,
    a
  );
  if (!l) return m;
  const u = h.get(a), f = c.start, b = o, P = u.positionAt(u.height - 1, b, a), D = m.doc.resolve(f + P), E = k.colSelection, O = u.positionAt(0, b, a), H = m.doc.resolve(f + O);
  return m.setSelection(E(D, H));
}
function it(e) {
  const { tr: t, origin: n, target: o, select: l = !0, pos: r } = e, s = r != null ? t.doc.resolve(r) : t.selection.$from, c = M(s);
  if (!c) return t;
  const { indexes: d } = te(n, t), { indexes: p } = te(o, t);
  if (d.includes(o)) return t;
  const a = st(c, d, p), m = _(t).replaceWith(
    c.pos,
    c.pos + c.node.nodeSize,
    a
  );
  if (!l) return m;
  const u = h.get(a), f = c.start, b = o, P = u.positionAt(b, u.width - 1, a), D = m.doc.resolve(f + P), E = k.rowSelection, O = u.positionAt(b, 0, a), H = m.doc.resolve(f + O);
  return m.setSelection(E(D, H));
}
const V = g(
  "GoToPrevTableCell",
  () => () => re(-1)
);
i(V, {
  displayName: "Command<goToPrevTableCellCommand>",
  group: "Table"
});
const U = g(
  "GoToNextTableCell",
  () => () => re(1)
);
i(U, {
  displayName: "Command<goToNextTableCellCommand>",
  group: "Table"
});
const X = g(
  "ExitTable",
  (e) => () => (t, n) => {
    if (!G(t)) return !1;
    const { $head: o } = t.selection, l = Je(o, N.type(e));
    if (!l) return !1;
    const { to: r } = l, s = t.tr.replaceWith(
      r,
      r,
      De.type(e).createAndFill()
    );
    return s.setSelection(ce.near(s.doc.resolve(r), 1)).scrollIntoView(), n == null || n(s), !0;
  }
);
i(X, {
  displayName: "Command<breakTableCommand>",
  group: "Table"
});
const he = g(
  "InsertTable",
  (e) => ({ row: t, col: n } = {}) => (o, l) => {
    const { selection: r, tr: s } = o, { from: c } = r, d = de(e, t, n), p = s.replaceSelectionWith(d), a = ce.findFrom(p.doc.resolve(c), 1, !0);
    return a && p.setSelection(a), l == null || l(p), !0;
  }
);
i(he, {
  displayName: "Command<insertTableCommand>",
  group: "Table"
});
const be = g(
  "MoveRow",
  () => ({ from: e, to: t, pos: n } = {}) => (o, l) => {
    const { tr: r } = o;
    return !!(l == null ? void 0 : l(
      it({ tr: r, origin: e ?? 0, target: t ?? 0, pos: n, select: !0 })
    ));
  }
);
i(be, {
  displayName: "Command<moveRowCommand>",
  group: "Table"
});
const Ce = g(
  "MoveCol",
  () => ({ from: e, to: t, pos: n } = {}) => (o, l) => {
    const { tr: r } = o;
    return !!(l == null ? void 0 : l(
      ct({ tr: r, origin: e ?? 0, target: t ?? 0, pos: n, select: !0 })
    ));
  }
);
i(Ce, {
  displayName: "Command<moveColCommand>",
  group: "Table"
});
const ye = g(
  "SelectRow",
  () => (e = { index: 0 }) => (t, n) => {
    const { tr: o } = t;
    return !!(n == null ? void 0 : n(lt(e.index, e.pos)(o)));
  }
);
i(ye, {
  displayName: "Command<selectRowCommand>",
  group: "Table"
});
const we = g(
  "SelectCol",
  () => (e = { index: 0 }) => (t, n) => {
    const { tr: o } = t;
    return !!(n == null ? void 0 : n(rt(e.index, e.pos)(o)));
  }
);
i(we, {
  displayName: "Command<selectColCommand>",
  group: "Table"
});
const ke = g(
  "SelectTable",
  () => () => (e, t) => {
    const { tr: n } = e;
    return !!(t == null ? void 0 : t(nt(n)));
  }
);
i(ke, {
  displayName: "Command<selectTableCommand>",
  group: "Table"
});
const Ne = g(
  "DeleteSelectedCells",
  () => () => (e, t) => {
    const { selection: n } = e;
    if (!(n instanceof k)) return !1;
    const o = n.isRowSelection(), l = n.isColSelection();
    return o && l ? Ke(e, t) : l ? Fe(e, t) : Ge(e, t);
  }
);
i(Ne, {
  displayName: "Command<deleteSelectedCellsCommand>",
  group: "Table"
});
const Te = g(
  "AddColBefore",
  () => () => We
);
i(Te, {
  displayName: "Command<addColBeforeCommand>",
  group: "Table"
});
const Se = g(
  "AddColAfter",
  () => () => ze
);
i(Se, {
  displayName: "Command<addColAfterCommand>",
  group: "Table"
});
const Re = g(
  "AddRowBefore",
  (e) => () => (t, n) => {
    if (!G(t)) return !1;
    if (n) {
      const o = ae(t);
      n(me(e, t.tr, o, o.top));
    }
    return !0;
  }
);
i(Re, {
  displayName: "Command<addRowBeforeCommand>",
  group: "Table"
});
const xe = g(
  "AddRowAfter",
  (e) => () => (t, n) => {
    if (!G(t)) return !1;
    if (n) {
      const o = ae(t);
      n(me(e, t.tr, o, o.bottom));
    }
    return !0;
  }
);
i(xe, {
  displayName: "Command<addRowAfterCommand>",
  group: "Table"
});
const Me = g(
  "SetAlign",
  () => (e = "left") => je("alignment", e)
);
i(Me, {
  displayName: "Command<setAlignCommand>",
  group: "Table"
});
const Ae = F(
  (e) => new ne(
    /^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/,
    (t, n, o, l) => {
      var d, p;
      const r = t.doc.resolve(o);
      if (!r.node(-1).canReplaceWith(
        r.index(-1),
        r.indexAfter(-1),
        N.type(e)
      ))
        return null;
      const s = de(
        e,
        Number((d = n.groups) == null ? void 0 : d.row),
        Number((p = n.groups) == null ? void 0 : p.col)
      ), c = t.tr.replaceRangeWith(o, l, s);
      return c.setSelection(Qe.create(c.doc, o + 3)).scrollIntoView();
    }
  )
);
i(Ae, {
  displayName: "InputRule<insertTableInputRule>",
  group: "Table"
});
const q = le("tableKeymap", {
  NextCell: {
    shortcuts: ["Mod-]", "Tab"],
    command: (e) => {
      const t = e.get(A);
      return () => t.call(U.key);
    }
  },
  PrevCell: {
    shortcuts: ["Mod-[", "Shift-Tab"],
    command: (e) => {
      const t = e.get(A);
      return () => t.call(V.key);
    }
  },
  ExitTable: {
    shortcuts: ["Mod-Enter"],
    command: (e) => {
      const t = e.get(A);
      return () => t.call(X.key);
    }
  }
});
i(q.ctx, {
  displayName: "KeymapCtx<table>",
  group: "Table"
});
i(q.shortcuts, {
  displayName: "Keymap<table>",
  group: "Table"
});
const B = "footnote_definition", oe = "footnoteDefinition", J = C(
  "footnote_definition",
  () => ({
    group: "block",
    content: "block+",
    defining: !0,
    attrs: {
      label: {
        default: ""
      }
    },
    parseDOM: [
      {
        tag: `dl[data-type="${B}"]`,
        getAttrs: (e) => {
          if (!(e instanceof HTMLElement)) throw K(e);
          return {
            label: e.dataset.label
          };
        },
        contentElement: "dd"
      }
    ],
    toDOM: (e) => {
      const t = e.attrs.label;
      return [
        "dl",
        {
          // TODO: add a prosemirror plugin to sync label on change
          "data-label": t,
          "data-type": B
        },
        ["dt", t],
        ["dd", 0]
      ];
    },
    parseMarkdown: {
      match: ({ type: e }) => e === oe,
      runner: (e, t, n) => {
        e.openNode(n, {
          label: t.label
        }).next(t.children).closeNode();
      }
    },
    toMarkdown: {
      match: (e) => e.type.name === B,
      runner: (e, t) => {
        e.openNode(oe, void 0, {
          label: t.attrs.label,
          identifier: t.attrs.label
        }).next(t.content).closeNode();
      }
    }
  })
);
i(J.ctx, {
  displayName: "NodeSchemaCtx<footnodeDef>",
  group: "footnote"
});
i(J.node, {
  displayName: "NodeSchema<footnodeDef>",
  group: "footnote"
});
const L = "footnote_reference", Q = C(
  "footnote_reference",
  () => ({
    group: "inline",
    inline: !0,
    atom: !0,
    attrs: {
      label: {
        default: ""
      }
    },
    parseDOM: [
      {
        tag: `sup[data-type="${L}"]`,
        getAttrs: (e) => {
          if (!(e instanceof HTMLElement)) throw K(e);
          return {
            label: e.dataset.label
          };
        }
      }
    ],
    toDOM: (e) => {
      const t = e.attrs.label;
      return [
        "sup",
        {
          // TODO: add a prosemirror plugin to sync label on change
          "data-label": t,
          "data-type": L
        },
        t
      ];
    },
    parseMarkdown: {
      match: ({ type: e }) => e === "footnoteReference",
      runner: (e, t, n) => {
        e.addNode(n, {
          label: t.label
        });
      }
    },
    toMarkdown: {
      match: (e) => e.type.name === L,
      runner: (e, t) => {
        e.addNode("footnoteReference", void 0, void 0, {
          label: t.attrs.label,
          identifier: t.attrs.label
        });
      }
    }
  })
);
i(Q.ctx, {
  displayName: "NodeSchemaCtx<footnodeRef>",
  group: "footnote"
});
i(Q.node, {
  displayName: "NodeSchema<footnodeRef>",
  group: "footnote"
});
const ve = Ee.extendSchema(
  (e) => (t) => {
    const n = e(t);
    return {
      ...n,
      attrs: {
        ...n.attrs,
        checked: {
          default: null
        }
      },
      parseDOM: [
        {
          tag: 'li[data-item-type="task"]',
          getAttrs: (o) => {
            if (!(o instanceof HTMLElement)) throw K(o);
            return {
              label: o.dataset.label,
              listType: o.dataset.listType,
              spread: o.dataset.spread,
              checked: o.dataset.checked ? o.dataset.checked === "true" : null
            };
          }
        },
        ...(n == null ? void 0 : n.parseDOM) || []
      ],
      toDOM: (o) => n.toDOM && o.attrs.checked == null ? n.toDOM(o) : [
        "li",
        {
          "data-item-type": "task",
          "data-label": o.attrs.label,
          "data-list-type": o.attrs.listType,
          "data-spread": o.attrs.spread,
          "data-checked": o.attrs.checked
        },
        0
      ],
      parseMarkdown: {
        match: ({ type: o }) => o === "listItem",
        runner: (o, l, r) => {
          if (l.checked == null) {
            n.parseMarkdown.runner(o, l, r);
            return;
          }
          const s = l.label != null ? `${l.label}.` : "•", c = l.checked != null ? !!l.checked : null, d = l.label != null ? "ordered" : "bullet", p = l.spread != null ? `${l.spread}` : "true";
          o.openNode(r, { label: s, listType: d, spread: p, checked: c }), o.next(l.children), o.closeNode();
        }
      },
      toMarkdown: {
        match: (o) => o.type.name === "list_item",
        runner: (o, l) => {
          if (l.attrs.checked == null) {
            n.toMarkdown.runner(o, l);
            return;
          }
          const r = l.attrs.label, s = l.attrs.listType, c = l.attrs.spread === "true", d = l.attrs.checked;
          o.openNode("listItem", void 0, {
            label: r,
            listType: s,
            spread: c,
            checked: d
          }), o.next(l.content), o.closeNode();
        }
      }
    };
  }
);
i(ve, {
  displayName: "NodeSchema<listItem>",
  group: "ListItem"
});
const _e = F(() => new ne(
  /^\[(?<checked>\s|x)\]\s$/,
  (e, t, n, o) => {
    var a;
    const l = e.doc.resolve(n);
    let r = 0, s = l.node(r);
    for (; s && s.type.name !== "list_item"; )
      r--, s = l.node(r);
    if (!s || s.attrs.checked != null) return null;
    const c = ((a = t.groups) == null ? void 0 : a.checked) === "x", d = l.before(r), p = e.tr;
    return p.deleteRange(n, o).setNodeMarkup(d, void 0, {
      ...s.attrs,
      checked: c
    }), p;
  }
));
i(_e, {
  displayName: "InputRule<wrapInTaskListInputRule>",
  group: "ListItem"
});
const dt = [
  j,
  q
].flat(), mt = [
  Ae,
  _e
], ut = [ie], $e = v(() => et);
i($e, {
  displayName: "Prose<autoInsertSpanPlugin>",
  group: "Prose"
});
const pt = v(() => Ve({}));
i(pt, {
  displayName: "Prose<columnResizingPlugin>",
  group: "Prose"
});
const Ie = v(
  () => Ue({ allowTableNodeSelection: !0 })
);
i(Ie, {
  displayName: "Prose<tableEditingPlugin>",
  group: "Prose"
});
const Y = Be("remarkGFM", () => tt);
i(Y.plugin, {
  displayName: "Remark<remarkGFMPlugin>",
  group: "Remark"
});
i(Y.options, {
  displayName: "RemarkConfig<remarkGFMPlugin>",
  group: "Remark"
});
const ft = new Ye("MILKDOWN_KEEP_TABLE_ALIGN_PLUGIN");
function gt(e, t) {
  let n = 0;
  return t.forEach((o, l, r) => {
    o === e && (n = r);
  }), n;
}
const Pe = v(() => new Ze({
  key: ft,
  appendTransaction: (e, t, n) => {
    let o;
    const l = (r, s) => {
      if (o || (o = n.tr), r.type.name !== "table_cell") return;
      const c = n.doc.resolve(s), d = c.node(c.depth), a = c.node(c.depth - 1).firstChild;
      if (!a) return;
      const m = gt(r, d), u = a.maybeChild(m);
      if (!u) return;
      const f = u.attrs.alignment, b = r.attrs.alignment;
      f !== b && o.setNodeMarkup(s, void 0, { ...r.attrs, alignment: f });
    };
    return t.doc !== n.doc && n.doc.descendants(l), o;
  }
}));
i(Pe, {
  displayName: "Prose<keepTableAlignPlugin>",
  group: "Prose"
});
const ht = [
  Pe,
  $e,
  Y,
  Ie
].flat(), bt = [
  ve,
  N,
  $,
  R,
  I,
  x,
  J,
  Q,
  W,
  T
].flat(), Ct = [
  U,
  V,
  X,
  he,
  be,
  Ce,
  ye,
  we,
  ke,
  Ne,
  Re,
  xe,
  Te,
  Se,
  Me,
  z
], _t = [
  bt,
  mt,
  ut,
  dt,
  Ct,
  ht
].flat();
export {
  Se as addColAfterCommand,
  Te as addColBeforeCommand,
  xe as addRowAfterCommand,
  Re as addRowBeforeCommand,
  me as addRowWithAlignment,
  $e as autoInsertSpanPlugin,
  pt as columnResizingPlugin,
  Ct as commands,
  de as createTable,
  Ne as deleteSelectedCellsCommand,
  X as exitTable,
  ve as extendListItemSchemaForTask,
  M as findTable,
  J as footnoteDefinitionSchema,
  Q as footnoteReferenceSchema,
  ot as getAllCellsInTable,
  y as getCellsInCol,
  w as getCellsInRow,
  _t as gfm,
  U as goToNextTableCellCommand,
  V as goToPrevTableCellCommand,
  mt as inputRules,
  he as insertTableCommand,
  Ae as insertTableInputRule,
  Pe as keepTableAlignPlugin,
  dt as keymap,
  ut as markInputRules,
  ct as moveCol,
  Ce as moveColCommand,
  it as moveRow,
  be as moveRowCommand,
  ht as plugins,
  Y as remarkGFMPlugin,
  bt as schema,
  rt as selectCol,
  we as selectColCommand,
  ue as selectLine,
  lt as selectRow,
  ye as selectRowCommand,
  nt as selectTable,
  ke as selectTableCommand,
  Me as setAlignCommand,
  W as strikethroughAttr,
  ie as strikethroughInputRule,
  j as strikethroughKeymap,
  T as strikethroughSchema,
  x as tableCellSchema,
  Ie as tableEditingPlugin,
  $ as tableHeaderRowSchema,
  I as tableHeaderSchema,
  q as tableKeymap,
  R as tableRowSchema,
  N as tableSchema,
  z as toggleStrikethroughCommand,
  _e as wrapInTaskListInputRule
};
//# sourceMappingURL=index.es.js.map
