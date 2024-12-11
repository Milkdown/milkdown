import { $markAttr as U, $markSchema as G, $command as c, $inputRule as h, $useKeymap as f, $node as Qe, $nodeAttr as N, $nodeSchema as I, $ctx as Xe, $remark as D, $prose as _ } from "@milkdown/utils";
import { remarkStringifyOptionsCtx as Ye, commandsCtx as u, editorViewCtx as At } from "@milkdown/core";
import { toggleMark as J, setBlockType as K, wrapIn as Q } from "@milkdown/prose/commands";
import { Fragment as wt } from "@milkdown/prose/model";
import { expectDomTypeError as A } from "@milkdown/exception";
import { textblockTypeInputRule as Ze, wrappingInputRule as X, InputRule as et } from "@milkdown/prose/inputrules";
import Ht from "@sindresorhus/slugify";
import { TextSelection as Y, Selection as tt, PluginKey as E, Plugin as P } from "@milkdown/prose/state";
import { markRule as j, findSelectedNodeOfType as Bt } from "@milkdown/prose";
import { sinkListItem as Rt, liftListItem as rt, splitListItem as vt } from "@milkdown/prose/schema-list";
import { ReplaceStep as Ot, AddMarkStep as Tt } from "@milkdown/prose/transform";
import { Decoration as ze, DecorationSet as Je } from "@milkdown/prose/view";
import { visit as Z } from "unist-util-visit";
import Kt from "remark-inline-links";
function at(t, e) {
  var o;
  if (!(e.childCount >= 1 && ((o = e.lastChild) == null ? void 0 : o.type.name) === "hardbreak")) {
    t.next(e.content);
    return;
  }
  const a = [];
  e.content.forEach((s, l, i) => {
    i !== e.childCount - 1 && a.push(s);
  }), t.next(wt.fromArray(a));
}
function n(t, e) {
  return Object.assign(t, {
    meta: {
      package: "@milkdown/preset-commonmark",
      ...e
    }
  }), t;
}
const ee = U("emphasis");
n(ee, {
  displayName: "Attr<emphasis>",
  group: "Emphasis"
});
const R = G("emphasis", (t) => ({
  attrs: {
    marker: {
      default: t.get(Ye).emphasis || "*"
    }
  },
  parseDOM: [
    { tag: "i" },
    { tag: "em" },
    { style: "font-style", getAttrs: (e) => e === "italic" }
  ],
  toDOM: (e) => ["em", t.get(ee.key)(e)],
  parseMarkdown: {
    match: (e) => e.type === "emphasis",
    runner: (e, r, a) => {
      e.openMark(a, { marker: r.marker }), e.next(r.children), e.closeMark(a);
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "emphasis",
    runner: (e, r) => {
      e.withMark(r, "emphasis", void 0, {
        marker: r.attrs.marker
      });
    }
  }
}));
n(R.mark, {
  displayName: "MarkSchema<emphasis>",
  group: "Emphasis"
});
n(R.ctx, {
  displayName: "MarkSchemaCtx<emphasis>",
  group: "Emphasis"
});
const te = c("ToggleEmphasis", (t) => () => J(R.type(t)));
n(te, {
  displayName: "Command<toggleEmphasisCommand>",
  group: "Emphasis"
});
const nt = h((t) => j(/(?:^|[^*])\*([^*]+)\*$/, R.type(t), {
  getAttr: () => ({
    marker: "*"
  }),
  updateCaptured: ({ fullMatch: e, start: r }) => e.startsWith("*") ? {} : { fullMatch: e.slice(1), start: r + 1 }
}));
n(nt, {
  displayName: "InputRule<emphasis>|Star",
  group: "Emphasis"
});
const ot = h((t) => j(/(?:^|[^_])_([^_]+)_$/, R.type(t), {
  getAttr: () => ({
    marker: "_"
  }),
  updateCaptured: ({ fullMatch: e, start: r }) => e.startsWith("_") ? {} : { fullMatch: e.slice(1), start: r + 1 }
}));
n(ot, {
  displayName: "InputRule<emphasis>|Underscore",
  group: "Emphasis"
});
const re = f("emphasisKeymap", {
  ToggleEmphasis: {
    shortcuts: "Mod-i",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(te.key);
    }
  }
});
n(re.ctx, {
  displayName: "KeymapCtx<emphasis>",
  group: "Emphasis"
});
n(re.shortcuts, {
  displayName: "Keymap<emphasis>",
  group: "Emphasis"
});
const ae = U("strong");
n(ae, {
  displayName: "Attr<strong>",
  group: "Strong"
});
const $ = G("strong", (t) => ({
  attrs: {
    marker: {
      default: t.get(Ye).strong || "*"
    }
  },
  parseDOM: [
    { tag: "b" },
    { tag: "strong" },
    { style: "font-style", getAttrs: (e) => e === "bold" }
  ],
  toDOM: (e) => ["strong", t.get(ae.key)(e)],
  parseMarkdown: {
    match: (e) => e.type === "strong",
    runner: (e, r, a) => {
      e.openMark(a, { marker: r.marker }), e.next(r.children), e.closeMark(a);
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "strong",
    runner: (e, r) => {
      e.withMark(r, "strong", void 0, {
        marker: r.attrs.marker
      });
    }
  }
}));
n($.mark, {
  displayName: "MarkSchema<strong>",
  group: "Strong"
});
n($.ctx, {
  displayName: "MarkSchemaCtx<strong>",
  group: "Strong"
});
const ne = c("ToggleStrong", (t) => () => J($.type(t)));
n(ne, {
  displayName: "Command<toggleStrongCommand>",
  group: "Strong"
});
const st = h((t) => j(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, $.type(t), {
  getAttr: (e) => ({
    marker: e[0].startsWith("*") ? "*" : "_"
  })
}));
n(st, {
  displayName: "InputRule<strong>",
  group: "Strong"
});
const oe = f("strongKeymap", {
  ToggleBold: {
    shortcuts: ["Mod-b"],
    command: (t) => {
      const e = t.get(u);
      return () => e.call(ne.key);
    }
  }
});
n(oe.ctx, {
  displayName: "KeymapCtx<strong>",
  group: "Strong"
});
n(oe.shortcuts, {
  displayName: "Keymap<strong>",
  group: "Strong"
});
const se = U("inlineCode");
n(se, {
  displayName: "Attr<inlineCode>",
  group: "InlineCode"
});
const x = G("inlineCode", (t) => ({
  priority: 100,
  code: !0,
  inclusive: !1,
  parseDOM: [{ tag: "code" }],
  toDOM: (e) => ["code", t.get(se.key)(e)],
  parseMarkdown: {
    match: (e) => e.type === "inlineCode",
    runner: (e, r, a) => {
      e.openMark(a), e.addText(r.value), e.closeMark(a);
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "inlineCode",
    runner: (e, r, a) => {
      e.withMark(r, "inlineCode", a.text || "");
    }
  }
}));
n(x.mark, {
  displayName: "MarkSchema<inlineCode>",
  group: "InlineCode"
});
n(x.ctx, {
  displayName: "MarkSchemaCtx<inlineCode>",
  group: "InlineCode"
});
const le = c("ToggleInlineCode", (t) => () => (e, r) => {
  const { selection: a, tr: o } = e;
  if (a.empty)
    return !1;
  const { from: s, to: l } = a;
  return e.doc.rangeHasMark(s, l, x.type(t)) ? (r == null || r(o.removeMark(s, l, x.type(t))), !0) : (Object.keys(e.schema.marks).filter((m) => m !== x.type.name).map((m) => e.schema.marks[m]).forEach((m) => {
    o.removeMark(s, l, m);
  }), r == null || r(o.addMark(s, l, x.type(t).create())), !0);
});
n(le, {
  displayName: "Command<toggleInlineCodeCommand>",
  group: "InlineCode"
});
const lt = h((t) => j(/(?:`)([^`]+)(?:`)$/, x.type(t)));
n(lt, {
  displayName: "InputRule<inlineCodeInputRule>",
  group: "InlineCode"
});
const ie = f("inlineCodeKeymap", {
  ToggleInlineCode: {
    shortcuts: "Mod-e",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(le.key);
    }
  }
});
n(ie.ctx, {
  displayName: "KeymapCtx<inlineCode>",
  group: "InlineCode"
});
n(ie.shortcuts, {
  displayName: "Keymap<inlineCode>",
  group: "InlineCode"
});
const de = U("link");
n(de, {
  displayName: "Attr<link>",
  group: "Link"
});
const B = G("link", (t) => ({
  attrs: {
    href: {},
    title: { default: null }
  },
  parseDOM: [
    {
      tag: "a[href]",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw A(e);
        return { href: e.getAttribute("href"), title: e.getAttribute("title") };
      }
    }
  ],
  toDOM: (e) => ["a", { ...t.get(de.key)(e), ...e.attrs }],
  parseMarkdown: {
    match: (e) => e.type === "link",
    runner: (e, r, a) => {
      const o = r.url, s = r.title;
      e.openMark(a, { href: o, title: s }), e.next(r.children), e.closeMark(a);
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "link",
    runner: (e, r) => {
      e.withMark(r, "link", void 0, {
        title: r.attrs.title,
        url: r.attrs.href
      });
    }
  }
}));
n(B.mark, {
  displayName: "MarkSchema<link>",
  group: "Link"
});
const it = c("ToggleLink", (t) => (e = {}) => J(B.type(t), e));
n(it, {
  displayName: "Command<toggleLinkCommand>",
  group: "Link"
});
const dt = c("UpdateLink", (t) => (e = {}) => (r, a) => {
  if (!a)
    return !1;
  let o, s = -1;
  const { selection: l } = r, { from: i, to: d } = l;
  if (r.doc.nodesBetween(i, i === d ? d + 1 : d, (k, b) => {
    if (B.type(t).isInSet(k.marks))
      return o = k, s = b, !1;
  }), !o)
    return !1;
  const m = o.marks.find(({ type: k }) => k === B.type(t));
  if (!m)
    return !1;
  const p = s, y = s + o.nodeSize, { tr: g } = r, C = B.type(t).create({ ...m.attrs, ...e });
  return C ? (a(
    g.removeMark(p, y, m).addMark(p, y, C).setSelection(new Y(g.selection.$anchor)).scrollIntoView()
  ), !0) : !1;
});
n(dt, {
  displayName: "Command<updateLinkCommand>",
  group: "Link"
});
const mt = Qe("doc", () => ({
  content: "block+",
  parseMarkdown: {
    match: ({ type: t }) => t === "root",
    runner: (t, e, r) => {
      t.injectRoot(e, r);
    }
  },
  toMarkdown: {
    match: (t) => t.type.name === "doc",
    runner: (t, e) => {
      t.openNode("root"), t.next(e.content);
    }
  }
}));
n(mt, {
  displayName: "NodeSchema<doc>",
  group: "Doc"
});
const me = N("paragraph");
n(me, {
  displayName: "Attr<paragraph>",
  group: "Paragraph"
});
const w = I("paragraph", (t) => ({
  content: "inline*",
  group: "block",
  parseDOM: [{ tag: "p" }],
  toDOM: (e) => ["p", t.get(me.key)(e), 0],
  parseMarkdown: {
    match: (e) => e.type === "paragraph",
    runner: (e, r, a) => {
      e.openNode(a), r.children ? e.next(r.children) : e.addText(r.value || ""), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "paragraph",
    runner: (e, r) => {
      e.openNode("paragraph"), at(e, r), e.closeNode();
    }
  }
}));
n(w.node, {
  displayName: "NodeSchema<paragraph>",
  group: "Paragraph"
});
n(w.ctx, {
  displayName: "NodeSchemaCtx<paragraph>",
  group: "Paragraph"
});
const pe = c("TurnIntoText", (t) => () => K(w.type(t)));
n(pe, {
  displayName: "Command<turnIntoTextCommand>",
  group: "Paragraph"
});
const ce = f("paragraphKeymap", {
  TurnIntoText: {
    shortcuts: "Mod-Alt-0",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(pe.key);
    }
  }
});
n(ce.ctx, {
  displayName: "KeymapCtx<paragraph>",
  group: "Paragraph"
});
n(ce.shortcuts, {
  displayName: "Keymap<paragraph>",
  group: "Paragraph"
});
const Dt = Array(6).fill(0).map((t, e) => e + 1);
function _t(t) {
  return Ht(t.textContent);
}
const z = Xe(_t, "headingIdGenerator");
n(z, {
  displayName: "Ctx<HeadingIdGenerator>",
  group: "Heading"
});
const ue = N("heading");
n(ue, {
  displayName: "Attr<heading>",
  group: "Heading"
});
const H = I("heading", (t) => {
  const e = t.get(z.key);
  return {
    content: "inline*",
    group: "block",
    defining: !0,
    attrs: {
      id: {
        default: ""
      },
      level: {
        default: 1
      }
    },
    parseDOM: Dt.map((r) => ({
      tag: `h${r}`,
      getAttrs: (a) => {
        if (!(a instanceof HTMLElement))
          throw A(a);
        return { level: r, id: a.id };
      }
    })),
    toDOM: (r) => [
      `h${r.attrs.level}`,
      {
        ...t.get(ue.key)(r),
        id: r.attrs.id || e(r)
      },
      0
    ],
    parseMarkdown: {
      match: ({ type: r }) => r === "heading",
      runner: (r, a, o) => {
        const s = a.depth;
        r.openNode(o, { level: s }), r.next(a.children), r.closeNode();
      }
    },
    toMarkdown: {
      match: (r) => r.type.name === "heading",
      runner: (r, a) => {
        r.openNode("heading", void 0, { depth: a.attrs.level }), at(r, a), r.closeNode();
      }
    }
  };
});
n(H.node, {
  displayName: "NodeSchema<heading>",
  group: "Heading"
});
n(H.ctx, {
  displayName: "NodeSchemaCtx<heading>",
  group: "Heading"
});
const pt = h((t) => Ze(/^(?<hashes>#+)\s$/, H.type(t), (e) => {
  var l, i;
  const r = ((i = (l = e.groups) == null ? void 0 : l.hashes) == null ? void 0 : i.length) || 0, a = t.get(At), { $from: o } = a.state.selection, s = o.node();
  if (s.type.name === "heading") {
    let d = Number(s.attrs.level) + Number(r);
    return d > 6 && (d = 6), { level: d };
  }
  return { level: r };
}));
n(pt, {
  displayName: "InputRule<wrapInHeadingInputRule>",
  group: "Heading"
});
const L = c("WrapInHeading", (t) => (e) => (e ?? (e = 1), e < 1 ? K(w.type(t)) : K(H.type(t), { level: e })));
n(L, {
  displayName: "Command<wrapInHeadingCommand>",
  group: "Heading"
});
const ge = c("DowngradeHeading", (t) => () => (e, r, a) => {
  const { $from: o } = e.selection, s = o.node();
  if (s.type !== H.type(t) || !e.selection.empty || o.parentOffset !== 0)
    return !1;
  const l = s.attrs.level - 1;
  return l ? (r == null || r(
    e.tr.setNodeMarkup(e.selection.$from.before(), void 0, {
      ...s.attrs,
      level: l
    })
  ), !0) : K(w.type(t))(e, r, a);
});
n(ge, {
  displayName: "Command<downgradeHeadingCommand>",
  group: "Heading"
});
const ke = f("headingKeymap", {
  TurnIntoH1: {
    shortcuts: "Mod-Alt-1",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(L.key, 1);
    }
  },
  TurnIntoH2: {
    shortcuts: "Mod-Alt-2",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(L.key, 2);
    }
  },
  TurnIntoH3: {
    shortcuts: "Mod-Alt-3",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(L.key, 3);
    }
  },
  TurnIntoH4: {
    shortcuts: "Mod-Alt-4",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(L.key, 4);
    }
  },
  TurnIntoH5: {
    shortcuts: "Mod-Alt-5",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(L.key, 5);
    }
  },
  TurnIntoH6: {
    shortcuts: "Mod-Alt-6",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(L.key, 6);
    }
  },
  DowngradeHeading: {
    shortcuts: ["Delete", "Backspace"],
    command: (t) => {
      const e = t.get(u);
      return () => e.call(ge.key);
    }
  }
});
n(ke.ctx, {
  displayName: "KeymapCtx<heading>",
  group: "Heading"
});
n(ke.shortcuts, {
  displayName: "Keymap<heading>",
  group: "Heading"
});
const ye = N("blockquote");
n(ye, {
  displayName: "Attr<blockquote>",
  group: "Blockquote"
});
const q = I("blockquote", (t) => ({
  content: "block+",
  group: "block",
  defining: !0,
  parseDOM: [{ tag: "blockquote" }],
  toDOM: (e) => ["blockquote", t.get(ye.key)(e), 0],
  parseMarkdown: {
    match: ({ type: e }) => e === "blockquote",
    runner: (e, r, a) => {
      e.openNode(a).next(r.children).closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "blockquote",
    runner: (e, r) => {
      e.openNode("blockquote").next(r.content).closeNode();
    }
  }
}));
n(q.node, {
  displayName: "NodeSchema<blockquote>",
  group: "Blockquote"
});
n(q.ctx, {
  displayName: "NodeSchemaCtx<blockquote>",
  group: "Blockquote"
});
const ct = h((t) => X(/^\s*>\s$/, q.type(t)));
n(ct, {
  displayName: "InputRule<wrapInBlockquoteInputRule>",
  group: "Blockquote"
});
const he = c("WrapInBlockquote", (t) => () => Q(q.type(t)));
n(he, {
  displayName: "Command<wrapInBlockquoteCommand>",
  group: "Blockquote"
});
const fe = f("blockquoteKeymap", {
  WrapInBlockquote: {
    shortcuts: "Mod-Shift-b",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(he.key);
    }
  }
});
n(fe.ctx, {
  displayName: "KeymapCtx<blockquote>",
  group: "Blockquote"
});
n(fe.shortcuts, {
  displayName: "Keymap<blockquote>",
  group: "Blockquote"
});
const Ne = N("codeBlock", () => ({
  pre: {},
  code: {}
}));
n(Ne, {
  displayName: "Attr<codeBlock>",
  group: "CodeBlock"
});
const W = I("code_block", (t) => ({
  content: "text*",
  group: "block",
  marks: "",
  defining: !0,
  code: !0,
  attrs: {
    language: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: "pre",
      preserveWhitespace: "full",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw A(e);
        return { language: e.dataset.language };
      }
    }
  ],
  toDOM: (e) => {
    const r = t.get(Ne.key)(e);
    return [
      "pre",
      {
        ...r.pre,
        "data-language": e.attrs.language
      },
      ["code", r.code, 0]
    ];
  },
  parseMarkdown: {
    match: ({ type: e }) => e === "code",
    runner: (e, r, a) => {
      const o = r.lang, s = r.value;
      e.openNode(a, { language: o }), s && e.addText(s), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "code_block",
    runner: (e, r) => {
      var a;
      e.addNode("code", void 0, ((a = r.content.firstChild) == null ? void 0 : a.text) || "", {
        lang: r.attrs.language
      });
    }
  }
}));
n(W.node, {
  displayName: "NodeSchema<codeBlock>",
  group: "CodeBlock"
});
n(W.ctx, {
  displayName: "NodeSchemaCtx<codeBlock>",
  group: "CodeBlock"
});
const ut = h((t) => Ze(/^```(?<language>[a-z]*)?[\s\n]$/, W.type(t), (e) => {
  var r;
  return {
    language: ((r = e.groups) == null ? void 0 : r.language) ?? ""
  };
}));
n(ut, {
  displayName: "InputRule<createCodeBlockInputRule>",
  group: "CodeBlock"
});
const Ie = c("CreateCodeBlock", (t) => (e = "") => K(W.type(t), { language: e }));
n(Ie, {
  displayName: "Command<createCodeBlockCommand>",
  group: "CodeBlock"
});
const Et = c("UpdateCodeBlockLanguage", () => ({ pos: t, language: e } = { pos: -1, language: "" }) => (r, a) => t >= 0 ? (a == null || a(r.tr.setNodeAttribute(t, "language", e)), !0) : !1);
n(Et, {
  displayName: "Command<updateCodeBlockLanguageCommand>",
  group: "CodeBlock"
});
const Ce = f("codeBlockKeymap", {
  CreateCodeBlock: {
    shortcuts: "Mod-Alt-c",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(Ie.key);
    }
  }
});
n(Ce.ctx, {
  displayName: "KeymapCtx<codeBlock>",
  group: "CodeBlock"
});
n(Ce.shortcuts, {
  displayName: "Keymap<codeBlock>",
  group: "CodeBlock"
});
const Me = N("image");
n(Me, {
  displayName: "Attr<image>",
  group: "Image"
});
const v = I("image", (t) => ({
  inline: !0,
  group: "inline",
  selectable: !0,
  draggable: !0,
  marks: "",
  atom: !0,
  defining: !0,
  isolating: !0,
  attrs: {
    src: { default: "" },
    alt: { default: "" },
    title: { default: "" }
  },
  parseDOM: [
    {
      tag: "img[src]",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw A(e);
        return {
          src: e.getAttribute("src") || "",
          alt: e.getAttribute("alt") || "",
          title: e.getAttribute("title") || e.getAttribute("alt") || ""
        };
      }
    }
  ],
  toDOM: (e) => ["img", { ...t.get(Me.key)(e), ...e.attrs }],
  parseMarkdown: {
    match: ({ type: e }) => e === "image",
    runner: (e, r, a) => {
      const o = r.url, s = r.alt, l = r.title;
      e.addNode(a, {
        src: o,
        alt: s,
        title: l
      });
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "image",
    runner: (e, r) => {
      e.addNode("image", void 0, void 0, {
        title: r.attrs.title,
        url: r.attrs.src,
        alt: r.attrs.alt
      });
    }
  }
}));
n(v.node, {
  displayName: "NodeSchema<image>",
  group: "Image"
});
n(v.ctx, {
  displayName: "NodeSchemaCtx<image>",
  group: "Image"
});
const gt = c("InsertImage", (t) => (e = {}) => (r, a) => {
  if (!a)
    return !0;
  const { src: o = "", alt: s = "", title: l = "" } = e, i = v.type(t).create({ src: o, alt: s, title: l });
  return i && a(r.tr.replaceSelectionWith(i).scrollIntoView()), !0;
});
n(gt, {
  displayName: "Command<insertImageCommand>",
  group: "Image"
});
const kt = c("UpdateImage", (t) => (e = {}) => (r, a) => {
  const o = Bt(r.selection, v.type(t));
  if (!o)
    return !1;
  const { node: s, pos: l } = o, i = { ...s.attrs }, { src: d, alt: m, title: p } = e;
  return d !== void 0 && (i.src = d), m !== void 0 && (i.alt = m), p !== void 0 && (i.title = p), a == null || a(r.tr.setNodeMarkup(l, void 0, i).scrollIntoView()), !0;
});
n(kt, {
  displayName: "Command<updateImageCommand>",
  group: "Image"
});
const Pt = h((t) => new et(
  /!\[(?<alt>.*?)]\((?<filename>.*?)\s*(?="|\))"?(?<title>[^"]+)?"?\)/,
  (e, r, a, o) => {
    const [s, l, i = "", d] = r;
    return s ? e.tr.replaceWith(a, o, v.type(t).create({ src: i, alt: l, title: d })) : null;
  }
));
n(Pt, {
  displayName: "InputRule<insertImageInputRule>",
  group: "Image"
});
const V = N("hardbreak", (t) => ({
  "data-type": "hardbreak",
  "data-is-inline": t.attrs.isInline
}));
n(V, {
  displayName: "Attr<hardbreak>",
  group: "Hardbreak"
});
const S = I("hardbreak", (t) => ({
  inline: !0,
  group: "inline",
  attrs: {
    isInline: {
      default: !1
    }
  },
  selectable: !1,
  parseDOM: [{ tag: "br" }, { tag: 'span[data-type="hardbreak"]', getAttrs: () => ({ isInline: !0 }) }],
  toDOM: (e) => e.attrs.isInline ? ["span", t.get(V.key)(e), " "] : ["br", t.get(V.key)(e)],
  parseMarkdown: {
    match: ({ type: e }) => e === "break",
    runner: (e, r, a) => {
      var o;
      e.addNode(a, { isInline: !!((o = r.data) != null && o.isInline) });
    }
  },
  leafText: () => `
`,
  toMarkdown: {
    match: (e) => e.type.name === "hardbreak",
    runner: (e, r) => {
      r.attrs.isInline ? e.addNode("text", void 0, `
`) : e.addNode("break");
    }
  }
}));
n(S.node, {
  displayName: "NodeSchema<hardbreak>",
  group: "Hardbreak"
});
n(S.ctx, {
  displayName: "NodeSchemaCtx<hardbreak>",
  group: "Hardbreak"
});
const be = c("InsertHardbreak", (t) => () => (e, r) => {
  var s;
  const { selection: a, tr: o } = e;
  if (!(a instanceof Y))
    return !1;
  if (a.empty) {
    const l = a.$from.node();
    if (l.childCount > 0 && ((s = l.lastChild) == null ? void 0 : s.type.name) === "hardbreak")
      return r == null || r(
        o.replaceRangeWith(a.to - 1, a.to, e.schema.node("paragraph")).setSelection(tt.near(o.doc.resolve(a.to))).scrollIntoView()
      ), !0;
  }
  return r == null || r(o.setMeta("hardbreak", !0).replaceSelectionWith(S.type(t).create()).scrollIntoView()), !0;
});
n(be, {
  displayName: "Command<insertHardbreakCommand>",
  group: "Hardbreak"
});
const Le = f("hardbreakKeymap", {
  InsertHardbreak: {
    shortcuts: "Shift-Enter",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(be.key);
    }
  }
});
n(Le.ctx, {
  displayName: "KeymapCtx<hardbreak>",
  group: "Hardbreak"
});
n(Le.shortcuts, {
  displayName: "Keymap<hardbreak>",
  group: "Hardbreak"
});
const xe = N("hr");
n(xe, {
  displayName: "Attr<hr>",
  group: "Hr"
});
const F = I("hr", (t) => ({
  group: "block",
  parseDOM: [{ tag: "hr" }],
  toDOM: (e) => ["hr", t.get(xe.key)(e)],
  parseMarkdown: {
    match: ({ type: e }) => e === "thematicBreak",
    runner: (e, r, a) => {
      e.addNode(a);
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "hr",
    runner: (e) => {
      e.addNode("thematicBreak");
    }
  }
}));
n(F.node, {
  displayName: "NodeSchema<hr>",
  group: "Hr"
});
n(F.ctx, {
  displayName: "NodeSchemaCtx<hr>",
  group: "Hr"
});
const yt = h((t) => new et(
  /^(?:---|___\s|\*\*\*\s)$/,
  (e, r, a, o) => {
    const { tr: s } = e;
    return r[0] && s.replaceWith(a - 1, o, F.type(t).create()), s;
  }
));
n(yt, {
  displayName: "InputRule<insertHrInputRule>",
  group: "Hr"
});
const ht = c("InsertHr", (t) => () => (e, r) => {
  if (!r)
    return !0;
  const a = w.node.type(t).create(), { tr: o, selection: s } = e, { from: l } = s, i = F.type(t).create();
  if (!i)
    return !0;
  const d = o.replaceSelectionWith(i).insert(l, a), m = tt.findFrom(d.doc.resolve(l), 1, !0);
  return m && r(d.setSelection(m).scrollIntoView()), !0;
});
n(ht, {
  displayName: "Command<insertHrCommand>",
  group: "Hr"
});
const Se = N("bulletList");
n(Se, {
  displayName: "Attr<bulletList>",
  group: "BulletList"
});
const O = I("bullet_list", (t) => ({
  content: "listItem+",
  group: "block",
  attrs: {
    spread: {
      default: !1
    }
  },
  parseDOM: [
    {
      tag: "ul",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw A(e);
        return {
          spread: e.dataset.spread
        };
      }
    }
  ],
  toDOM: (e) => [
    "ul",
    {
      ...t.get(Se.key)(e),
      "data-spread": e.attrs.spread
    },
    0
  ],
  parseMarkdown: {
    match: ({ type: e, ordered: r }) => e === "list" && !r,
    runner: (e, r, a) => {
      const o = r.spread != null ? `${r.spread}` : "false";
      e.openNode(a, { spread: o }).next(r.children).closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "bullet_list",
    runner: (e, r) => {
      e.openNode("list", void 0, { ordered: !1, spread: r.attrs.spread === "true" }).next(r.content).closeNode();
    }
  }
}));
n(O.node, {
  displayName: "NodeSchema<bulletList>",
  group: "BulletList"
});
n(O.ctx, {
  displayName: "NodeSchemaCtx<bulletList>",
  group: "BulletList"
});
const ft = h((t) => X(/^\s*([-+*])\s$/, O.type(t)));
n(ft, {
  displayName: "InputRule<wrapInBulletListInputRule>",
  group: "BulletList"
});
const Ae = c("WrapInBulletList", (t) => () => Q(O.type(t)));
n(Ae, {
  displayName: "Command<wrapInBulletListCommand>",
  group: "BulletList"
});
const we = f("bulletListKeymap", {
  WrapInBulletList: {
    shortcuts: "Mod-Alt-8",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(Ae.key);
    }
  }
});
n(we.ctx, {
  displayName: "KeymapCtx<bulletListKeymap>",
  group: "BulletList"
});
n(we.shortcuts, {
  displayName: "Keymap<bulletListKeymap>",
  group: "BulletList"
});
const He = N("orderedList");
n(He, {
  displayName: "Attr<orderedList>",
  group: "OrderedList"
});
const T = I("ordered_list", (t) => ({
  content: "listItem+",
  group: "block",
  attrs: {
    order: {
      default: 1
    },
    spread: {
      default: !1
    }
  },
  parseDOM: [
    {
      tag: "ol",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw A(e);
        return {
          spread: e.dataset.spread,
          order: e.hasAttribute("start") ? Number(e.getAttribute("start")) : 1
        };
      }
    }
  ],
  toDOM: (e) => [
    "ol",
    {
      ...t.get(He.key)(e),
      ...e.attrs.order === 1 ? {} : e.attrs.order,
      "data-spread": e.attrs.spread
    },
    0
  ],
  parseMarkdown: {
    match: ({ type: e, ordered: r }) => e === "list" && !!r,
    runner: (e, r, a) => {
      const o = r.spread != null ? `${r.spread}` : "true";
      e.openNode(a, { spread: o }).next(r.children).closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "ordered_list",
    runner: (e, r) => {
      e.openNode("list", void 0, { ordered: !0, start: 1, spread: r.attrs.spread === "true" }), e.next(r.content), e.closeNode();
    }
  }
}));
n(T.node, {
  displayName: "NodeSchema<orderedList>",
  group: "OrderedList"
});
n(T.ctx, {
  displayName: "NodeSchemaCtx<orderedList>",
  group: "OrderedList"
});
const Nt = h((t) => X(
  /^\s*(\d+)\.\s$/,
  T.type(t),
  (e) => ({ order: Number(e[1]) }),
  (e, r) => r.childCount + r.attrs.order === Number(e[1])
));
n(Nt, {
  displayName: "InputRule<wrapInOrderedListInputRule>",
  group: "OrderedList"
});
const Be = c("WrapInOrderedList", (t) => () => Q(T.type(t)));
n(Be, {
  displayName: "Command<wrapInOrderedListCommand>",
  group: "OrderedList"
});
const Re = f("orderedListKeymap", {
  WrapInOrderedList: {
    shortcuts: "Mod-Alt-7",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(Be.key);
    }
  }
});
n(Re.ctx, {
  displayName: "KeymapCtx<orderedList>",
  group: "OrderedList"
});
n(Re.shortcuts, {
  displayName: "Keymap<orderedList>",
  group: "OrderedList"
});
const ve = N("listItem");
n(ve, {
  displayName: "Attr<listItem>",
  group: "ListItem"
});
const M = I("list_item", (t) => ({
  group: "listItem",
  content: "(paragraph|blockquote) block*",
  attrs: {
    label: {
      default: "•"
    },
    listType: {
      default: "bullet"
    },
    spread: {
      default: "true"
    }
  },
  defining: !0,
  parseDOM: [
    {
      tag: "li",
      getAttrs: (e) => {
        if (!(e instanceof HTMLElement))
          throw A(e);
        return {
          label: e.dataset.label,
          listType: e.dataset.listType,
          spread: e.dataset.spread
        };
      }
    }
  ],
  toDOM: (e) => [
    "li",
    {
      ...t.get(ve.key)(e),
      "data-label": e.attrs.label,
      "data-list-type": e.attrs.listType,
      "data-spread": e.attrs.spread
    },
    0
  ],
  parseMarkdown: {
    match: ({ type: e }) => e === "listItem",
    runner: (e, r, a) => {
      const o = r.label != null ? `${r.label}.` : "•", s = r.label != null ? "ordered" : "bullet", l = r.spread != null ? `${r.spread}` : "true";
      e.openNode(a, { label: o, listType: s, spread: l }), e.next(r.children), e.closeNode();
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "list_item",
    runner: (e, r) => {
      e.openNode("listItem", void 0, { spread: r.attrs.spread === "true" }), e.next(r.content), e.closeNode();
    }
  }
}));
n(M.node, {
  displayName: "NodeSchema<listItem>",
  group: "ListItem"
});
n(M.ctx, {
  displayName: "NodeSchemaCtx<listItem>",
  group: "ListItem"
});
const Oe = c("SinkListItem", (t) => () => Rt(M.type(t)));
n(Oe, {
  displayName: "Command<sinkListItemCommand>",
  group: "ListItem"
});
const Te = c("LiftListItem", (t) => () => rt(M.type(t)));
n(Te, {
  displayName: "Command<liftListItemCommand>",
  group: "ListItem"
});
const Ke = c("SplitListItem", (t) => () => vt(M.type(t)));
n(Ke, {
  displayName: "Command<splitListItemCommand>",
  group: "ListItem"
});
function $t(t) {
  return (e, r, a) => {
    const { selection: o } = e;
    if (!(o instanceof Y))
      return !1;
    const { empty: s, $from: l } = o;
    if (!s || l.parentOffset !== 0)
      return !1;
    const i = l.node(-1);
    return i.type !== M.type(t) || i.firstChild !== l.node() || l.node(-2).childCount > 1 ? !1 : rt(M.type(t))(e, r, a);
  };
}
const De = c("LiftFirstListItem", (t) => () => $t(t));
n(De, {
  displayName: "Command<liftFirstListItemCommand>",
  group: "ListItem"
});
const _e = f("listItemKeymap", {
  NextListItem: {
    shortcuts: "Enter",
    command: (t) => {
      const e = t.get(u);
      return () => e.call(Ke.key);
    }
  },
  SinkListItem: {
    shortcuts: ["Tab", "Mod-]"],
    command: (t) => {
      const e = t.get(u);
      return () => e.call(Oe.key);
    }
  },
  LiftListItem: {
    shortcuts: ["Shift-Tab", "Mod-["],
    command: (t) => {
      const e = t.get(u);
      return () => e.call(Te.key);
    }
  },
  LiftFirstListItem: {
    shortcuts: ["Backspace", "Delete"],
    command: (t) => {
      const e = t.get(u);
      return () => e.call(De.key);
    }
  }
});
n(_e.ctx, {
  displayName: "KeymapCtx<listItem>",
  group: "ListItem"
});
n(_e.shortcuts, {
  displayName: "Keymap<listItem>",
  group: "ListItem"
});
const It = Qe("text", () => ({
  group: "inline",
  parseMarkdown: {
    match: ({ type: t }) => t === "text",
    runner: (t, e) => {
      t.addText(e.value);
    }
  },
  toMarkdown: {
    match: (t) => t.type.name === "text",
    runner: (t, e) => {
      t.addNode("text", void 0, e.text);
    }
  }
}));
n(It, {
  displayName: "NodeSchema<text>",
  group: "Text"
});
const Ee = N("html");
n(Ee, {
  displayName: "Attr<html>",
  group: "Html"
});
const Pe = I("html", (t) => ({
  atom: !0,
  group: "inline",
  inline: !0,
  attrs: {
    value: {
      default: ""
    }
  },
  toDOM: (e) => {
    const r = document.createElement("span"), a = {
      ...t.get(Ee.key)(e),
      "data-value": e.attrs.value,
      "data-type": "html"
    };
    return r.textContent = e.attrs.value, ["span", a, e.attrs.value];
  },
  parseDOM: [{
    tag: 'span[data-type="html"]',
    getAttrs: (e) => ({
      value: e.dataset.value ?? ""
    })
  }],
  parseMarkdown: {
    match: ({ type: e }) => e === "html",
    runner: (e, r, a) => {
      e.addNode(a, { value: r.value });
    }
  },
  toMarkdown: {
    match: (e) => e.type.name === "html",
    runner: (e, r) => {
      e.addNode("html", void 0, r.attrs.value);
    }
  }
}));
n(Pe.node, {
  displayName: "NodeSchema<html>",
  group: "Html"
});
n(Pe.ctx, {
  displayName: "NodeSchemaCtx<html>",
  group: "Html"
});
const qt = [
  mt,
  me,
  w,
  z,
  ue,
  H,
  V,
  S,
  ye,
  q,
  Ne,
  W,
  xe,
  F,
  Me,
  v,
  Se,
  O,
  He,
  T,
  ve,
  M,
  ee,
  R,
  ae,
  $,
  se,
  x,
  de,
  B,
  Ee,
  Pe,
  It
].flat(), Wt = [
  ct,
  ft,
  Nt,
  ut,
  yt,
  pt
].flat(), Ft = [
  nt,
  ot,
  lt,
  st
], Vt = [
  pe,
  he,
  L,
  ge,
  Ie,
  be,
  ht,
  gt,
  kt,
  Be,
  Ae,
  Oe,
  Ke,
  Te,
  De,
  te,
  le,
  ne,
  it,
  dt
], Ut = [
  fe,
  Ce,
  Le,
  ke,
  _e,
  Re,
  we,
  ce,
  re,
  ie,
  oe
].flat(), $e = D("remarkAddOrderInList", () => () => (t) => {
  Z(t, "list", (e) => {
    if (e.ordered) {
      const r = e.start ?? 1;
      e.children.forEach((a, o) => {
        a.label = o + r;
      });
    }
  });
});
n($e.plugin, {
  displayName: "Remark<remarkAddOrderInListPlugin>",
  group: "Remark"
});
n($e.options, {
  displayName: "RemarkConfig<remarkAddOrderInListPlugin>",
  group: "Remark"
});
const qe = D("remarkLineBreak", () => () => (t) => {
  const e = /[\t ]*(?:\r?\n|\r)/g;
  Z(t, "text", (r, a, o) => {
    if (!r.value || typeof r.value != "string")
      return;
    const s = [];
    let l = 0;
    e.lastIndex = 0;
    let i = e.exec(r.value);
    for (; i; ) {
      const m = i.index;
      l !== m && s.push({ type: "text", value: r.value.slice(l, m) }), s.push({ type: "break", data: { isInline: !0 } }), l = m + i[0].length, i = e.exec(r.value);
    }
    if (s.length > 0 && o && typeof a == "number")
      return l < r.value.length && s.push({ type: "text", value: r.value.slice(l) }), o.children.splice(a, 1, ...s), a + s.length;
  });
});
n(qe.plugin, {
  displayName: "Remark<remarkLineBreak>",
  group: "Remark"
});
n(qe.options, {
  displayName: "RemarkConfig<remarkLineBreak>",
  group: "Remark"
});
const We = D("remarkInlineLink", () => Kt);
n(We.plugin, {
  displayName: "Remark<remarkInlineLinkPlugin>",
  group: "Remark"
});
n(We.options, {
  displayName: "RemarkConfig<remarkInlineLinkPlugin>",
  group: "Remark"
});
const Gt = (t) => !!t.children, jt = (t) => t.type === "html";
function zt(t, e) {
  return r(t, 0, null)[0];
  function r(a, o, s) {
    if (Gt(a)) {
      const l = [];
      for (let i = 0, d = a.children.length; i < d; i++) {
        const m = a.children[i];
        if (m) {
          const p = r(m, i, a);
          if (p)
            for (let y = 0, g = p.length; y < g; y++) {
              const C = p[y];
              C && l.push(C);
            }
        }
      }
      a.children = l;
    }
    return e(a, o, s);
  }
}
const Fe = D("remarkHTMLTransformer", () => () => (t) => {
  zt(t, (e, r, a) => jt(e) ? ((a == null ? void 0 : a.type) === "root" && (e.children = [{ ...e }], delete e.value, e.type = "paragraph"), [e]) : [e]);
});
n(Fe.plugin, {
  displayName: "Remark<remarkHtmlTransformer>",
  group: "Remark"
});
n(Fe.options, {
  displayName: "RemarkConfig<remarkHtmlTransformer>",
  group: "Remark"
});
const Ve = D("remarkMarker", () => () => (t, e) => {
  const r = (a) => e.value.charAt(a.position.start.offset);
  Z(t, (a) => ["strong", "emphasis"].includes(a.type), (a) => {
    a.marker = r(a);
  });
});
n(Ve.plugin, {
  displayName: "Remark<remarkMarker>",
  group: "Remark"
});
n(Ve.options, {
  displayName: "RemarkConfig<remarkMarker>",
  group: "Remark"
});
const Ct = _(() => {
  let t = !1;
  const e = new E("MILKDOWN_INLINE_NODES_CURSOR"), r = new P({
    key: e,
    state: {
      init() {
        return !1;
      },
      apply(a) {
        if (!a.selection.empty)
          return !1;
        const o = a.selection.$from, s = o.nodeBefore, l = o.nodeAfter;
        return !!(s && l && s.isInline && !s.isText && l.isInline && !l.isText);
      }
    },
    props: {
      handleDOMEvents: {
        compositionend: (a, o) => t ? (t = !1, requestAnimationFrame(() => {
          if (r.getState(a.state)) {
            const l = a.state.selection.from;
            o.preventDefault(), a.dispatch(a.state.tr.insertText(o.data || "", l));
          }
        }), !0) : !1,
        compositionstart: (a) => (r.getState(a.state) && (t = !0), !1),
        beforeinput: (a, o) => {
          if (r.getState(a.state) && o instanceof InputEvent && o.data && !t) {
            const l = a.state.selection.from;
            return o.preventDefault(), a.dispatch(a.state.tr.insertText(o.data || "", l)), !0;
          }
          return !1;
        }
      },
      decorations(a) {
        if (r.getState(a)) {
          const l = a.selection.$from.pos, i = document.createElement("span"), d = ze.widget(l, i, {
            side: -1
          }), m = document.createElement("span"), p = ze.widget(l, m);
          return setTimeout(() => {
            i.contentEditable = "true", m.contentEditable = "true";
          }), Je.create(a.doc, [d, p]);
        }
        return Je.empty;
      }
    }
  });
  return r;
});
n(Ct, {
  displayName: "Prose<inlineNodesCursorPlugin>",
  group: "Prose"
});
const Mt = _((t) => new P({
  key: new E("MILKDOWN_HARDBREAK_MARKS"),
  appendTransaction: (e, r, a) => {
    if (!e.length)
      return;
    const [o] = e;
    if (!o)
      return;
    const [s] = o.steps;
    if (o.getMeta("hardbreak")) {
      if (!(s instanceof Ot))
        return;
      const { from: d } = s;
      return a.tr.setNodeMarkup(d, S.type(t), void 0, []);
    }
    if (s instanceof Tt) {
      let d = a.tr;
      const { from: m, to: p } = s;
      return a.doc.nodesBetween(m, p, (y, g) => {
        y.type === S.type(t) && (d = d.setNodeMarkup(g, S.type(t), void 0, []));
      }), d;
    }
  }
}));
n(Mt, {
  displayName: "Prose<hardbreakClearMarkPlugin>",
  group: "Prose"
});
const Ue = Xe(["table", "code_block"], "hardbreakFilterNodes");
n(Ue, {
  displayName: "Ctx<hardbreakFilterNodes>",
  group: "Prose"
});
const bt = _((t) => {
  const e = t.get(Ue.key);
  return new P({
    key: new E("MILKDOWN_HARDBREAK_FILTER"),
    filterTransaction: (r, a) => {
      const o = r.getMeta("hardbreak"), [s] = r.steps;
      if (o && s) {
        const { from: l } = s, i = a.doc.resolve(l);
        let d = i.depth, m = !0;
        for (; d > 0; )
          e.includes(i.node(d).type.name) && (m = !1), d--;
        return m;
      }
      return !0;
    }
  });
});
n(bt, {
  displayName: "Prose<hardbreakFilterPlugin>",
  group: "Prose"
});
const Lt = _((t) => {
  const e = new E("MILKDOWN_HEADING_ID"), r = (a) => {
    if (a.composing)
      return;
    const o = t.get(z.key), s = a.state.tr.setMeta("addToHistory", !1);
    let l = !1;
    a.state.doc.descendants((i, d) => {
      if (i.type === H.type(t)) {
        if (i.textContent.trim().length === 0)
          return;
        const m = i.attrs, p = o(i);
        m.id !== p && (l = !0, s.setMeta(e, !0).setNodeMarkup(d, void 0, {
          ...m,
          id: p
        }));
      }
    }), l && a.dispatch(s);
  };
  return new P({
    key: e,
    view: (a) => (r(a), {
      update: (o, s) => {
        o.state.doc.eq(s.doc) || r(o);
      }
    })
  });
});
n(Lt, {
  displayName: "Prose<syncHeadingIdPlugin>",
  group: "Prose"
});
const xt = _((t) => {
  const e = (r) => {
    if (r.composing || !r.editable)
      return;
    const a = T.type(t), o = O.type(t), s = M.type(t), l = r.state, i = (p, y) => {
      let g = !1;
      const C = `${y + 1}.`;
      return p.label !== C && (p.label = C, g = !0), g;
    };
    let d = l.tr, m = !1;
    l.doc.descendants((p, y, g, C) => {
      if (p.type === o) {
        const k = p.maybeChild(0);
        (k == null ? void 0 : k.type) === s && k.attrs.listType === "ordered" && (m = !0, d.setNodeMarkup(y, a, { spread: "true" }), p.descendants((b, Ge, Qt, St) => {
          if (b.type === s) {
            const je = { ...b.attrs };
            i(je, St) && (d = d.setNodeMarkup(Ge, void 0, je));
          }
          return !1;
        }));
      } else if (p.type === s && (g == null ? void 0 : g.type) === a) {
        const k = { ...p.attrs };
        let b = !1;
        k.listType !== "ordered" && (k.listType = "ordered", b = !0), (g == null ? void 0 : g.maybeChild(0)) && (b = i(k, C)), b && (d = d.setNodeMarkup(y, void 0, k), m = !0);
      }
    }), m && r.dispatch(d.setMeta("addToHistory", !1));
  };
  return new P({
    key: new E("MILKDOWN_KEEP_LIST_ORDER"),
    view: (r) => (e(r), {
      update: (a) => {
        e(a);
      }
    })
  });
});
n(xt, {
  displayName: "Prose<syncListOrderPlugin>",
  group: "Prose"
});
const Jt = [
  Mt,
  Ue,
  bt,
  Ct,
  $e,
  We,
  qe,
  Fe,
  Ve,
  Lt,
  xt
].flat(), cr = [qt, Wt, Ft, Vt, Ut, Jt].flat();
export {
  ye as blockquoteAttr,
  fe as blockquoteKeymap,
  q as blockquoteSchema,
  Se as bulletListAttr,
  we as bulletListKeymap,
  O as bulletListSchema,
  Ne as codeBlockAttr,
  Ce as codeBlockKeymap,
  W as codeBlockSchema,
  Vt as commands,
  cr as commonmark,
  Ie as createCodeBlockCommand,
  ut as createCodeBlockInputRule,
  mt as docSchema,
  ge as downgradeHeadingCommand,
  ee as emphasisAttr,
  re as emphasisKeymap,
  R as emphasisSchema,
  nt as emphasisStarInputRule,
  ot as emphasisUnderscoreInputRule,
  V as hardbreakAttr,
  Mt as hardbreakClearMarkPlugin,
  Ue as hardbreakFilterNodes,
  bt as hardbreakFilterPlugin,
  Le as hardbreakKeymap,
  S as hardbreakSchema,
  ue as headingAttr,
  z as headingIdGenerator,
  ke as headingKeymap,
  H as headingSchema,
  xe as hrAttr,
  F as hrSchema,
  Ee as htmlAttr,
  Pe as htmlSchema,
  Me as imageAttr,
  v as imageSchema,
  se as inlineCodeAttr,
  lt as inlineCodeInputRule,
  ie as inlineCodeKeymap,
  x as inlineCodeSchema,
  Ct as inlineNodesCursorPlugin,
  Wt as inputRules,
  be as insertHardbreakCommand,
  ht as insertHrCommand,
  yt as insertHrInputRule,
  gt as insertImageCommand,
  Pt as insertImageInputRule,
  Ut as keymap,
  De as liftFirstListItemCommand,
  Te as liftListItemCommand,
  de as linkAttr,
  B as linkSchema,
  ve as listItemAttr,
  _e as listItemKeymap,
  M as listItemSchema,
  Ft as markInputRules,
  He as orderedListAttr,
  Re as orderedListKeymap,
  T as orderedListSchema,
  me as paragraphAttr,
  ce as paragraphKeymap,
  w as paragraphSchema,
  Jt as plugins,
  $e as remarkAddOrderInListPlugin,
  Fe as remarkHtmlTransformer,
  We as remarkInlineLinkPlugin,
  qe as remarkLineBreak,
  Ve as remarkMarker,
  qt as schema,
  Oe as sinkListItemCommand,
  Ke as splitListItemCommand,
  ae as strongAttr,
  st as strongInputRule,
  oe as strongKeymap,
  $ as strongSchema,
  Lt as syncHeadingIdPlugin,
  xt as syncListOrderPlugin,
  It as textSchema,
  te as toggleEmphasisCommand,
  le as toggleInlineCodeCommand,
  it as toggleLinkCommand,
  ne as toggleStrongCommand,
  pe as turnIntoTextCommand,
  Et as updateCodeBlockLanguageCommand,
  kt as updateImageCommand,
  dt as updateLinkCommand,
  he as wrapInBlockquoteCommand,
  ct as wrapInBlockquoteInputRule,
  Ae as wrapInBulletListCommand,
  ft as wrapInBulletListInputRule,
  L as wrapInHeadingCommand,
  pt as wrapInHeadingInputRule,
  Be as wrapInOrderedListCommand,
  Nt as wrapInOrderedListInputRule
};
//# sourceMappingURL=index.es.js.map
