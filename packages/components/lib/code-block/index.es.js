import { $ctx, $view } from '@milkdown/utils';
import { codeBlockSchema } from '@milkdown/preset-commonmark';
import { html, c, useHost, useRef, useState, useMemo, useEffect, useLayoutEffect, h } from 'atomico';
import { EditorView, keymap } from '@codemirror/view';
import { undo, redo } from '@milkdown/prose/history';
import { Compartment, EditorState } from '@codemirror/state';
import { exitCode } from '@milkdown/prose/commands';
import { TextSelection } from '@milkdown/prose/state';
import { computePosition } from '@floating-ui/dom';
import clsx from 'clsx';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
function withMeta(plugin, meta) {
  Object.assign(plugin, {
    meta: __spreadValues({
      package: "@milkdown/components"
    }, meta)
  });
  return plugin;
}

const defaultConfig = {
  extensions: [],
  languages: [],
  expandIcon: () => "\u2B07",
  searchIcon: () => "\u{1F50D}",
  clearSearchIcon: () => "\u232B",
  searchPlaceholder: "Search language",
  noResultText: "No result",
  renderLanguage: (language) => html`${language}`
};
const codeBlockConfig = $ctx(defaultConfig, "codeBlockConfigCtx");
withMeta(codeBlockConfig, {
  displayName: "Config<code-block>",
  group: "CodeBlock"
});

function defIfNotExists(tagName, element) {
  const current = customElements.get(tagName);
  if (current == null) {
    customElements.define(tagName, element);
    return;
  }
  if (current === element) return;
  console.warn(`Custom element ${tagName} has been defined before.`);
}

var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
class CodeMirrorBlock {
  constructor(node, view, getPos, loader, config) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.loader = loader;
    this.config = config;
    this.updating = false;
    this.languageName = "";
    this.forwardUpdate = (update) => {
      var _a;
      if (this.updating || !this.cm.hasFocus) return;
      let offset = ((_a = this.getPos()) != null ? _a : 0) + 1;
      const { main } = update.state.selection;
      const selFrom = offset + main.from;
      const selTo = offset + main.to;
      const pmSel = this.view.state.selection;
      if (update.docChanged || pmSel.from !== selFrom || pmSel.to !== selTo) {
        const tr = this.view.state.tr;
        update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
          if (text.length)
            tr.replaceWith(
              offset + fromA,
              offset + toA,
              this.view.state.schema.text(text.toString())
            );
          else tr.delete(offset + fromA, offset + toA);
          offset += toB - fromB - (toA - fromA);
        });
        tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo));
        this.view.dispatch(tr);
      }
    };
    this.codeMirrorKeymap = () => {
      const view = this.view;
      return [
        { key: "ArrowUp", run: () => this.maybeEscape("line", -1) },
        { key: "ArrowLeft", run: () => this.maybeEscape("char", -1) },
        { key: "ArrowDown", run: () => this.maybeEscape("line", 1) },
        { key: "ArrowRight", run: () => this.maybeEscape("char", 1) },
        {
          key: "Mod-Enter",
          run: () => {
            if (!exitCode(view.state, view.dispatch)) return false;
            view.focus();
            return true;
          }
        },
        { key: "Mod-z", run: () => undo(view.state, view.dispatch) },
        { key: "Shift-Mod-z", run: () => redo(view.state, view.dispatch) },
        { key: "Mod-y", run: () => redo(view.state, view.dispatch) },
        {
          key: "Backspace",
          run: () => {
            var _a;
            const ranges = this.cm.state.selection.ranges;
            if (ranges.length > 1) return false;
            const selection = ranges[0];
            if (selection && (!selection.empty || selection.anchor > 0))
              return false;
            if (this.cm.state.doc.lines >= 2) return false;
            const state = this.view.state;
            const pos = (_a = this.getPos()) != null ? _a : 0;
            const tr = state.tr.replaceWith(
              pos,
              pos + this.node.nodeSize,
              state.schema.nodes.paragraph.createChecked({}, this.node.content)
            );
            tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
            this.view.dispatch(tr);
            this.view.focus();
            return true;
          }
        }
      ];
    };
    this.maybeEscape = (unit, dir) => {
      var _a;
      const { state } = this.cm;
      let main = state.selection.main;
      if (!main.empty) return false;
      if (unit === "line") main = state.doc.lineAt(main.head);
      if (dir < 0 ? main.from > 0 : main.to < state.doc.length) return false;
      const targetPos = ((_a = this.getPos()) != null ? _a : 0) + (dir < 0 ? 0 : this.node.nodeSize);
      const selection = TextSelection.near(
        this.view.state.doc.resolve(targetPos),
        dir
      );
      const tr = this.view.state.tr.setSelection(selection).scrollIntoView();
      this.view.dispatch(tr);
      this.view.focus();
      return true;
    };
    this.setLanguage = (language) => {
      var _a;
      this.view.dispatch(
        this.view.state.tr.setNodeAttribute(
          (_a = this.getPos()) != null ? _a : 0,
          "language",
          language
        )
      );
    };
    this.getAllLanguages = () => {
      return this.loader.getAll();
    };
    this.languageConf = new Compartment();
    this.readOnlyConf = new Compartment();
    this.cm = new EditorView({
      doc: this.node.textContent,
      root: this.view.root,
      extensions: [
        this.readOnlyConf.of(EditorState.readOnly.of(!this.view.editable)),
        keymap.of(this.codeMirrorKeymap()),
        this.languageConf.of([]),
        ...config.extensions,
        EditorView.updateListener.of(this.forwardUpdate)
      ]
    });
    this.dom = this.createDom();
    this.updateLanguage();
  }
  createDom() {
    const dom = document.createElement("milkdown-code-block");
    dom.codemirror = this.cm;
    dom.getAllLanguages = this.getAllLanguages;
    dom.setLanguage = this.setLanguage;
    dom.isEditorReadonly = () => !this.view.editable;
    const _a = this.config, viewConfig = __objRest(_a, ["languages", "extensions"]);
    dom.config = viewConfig;
    return dom;
  }
  updateLanguage() {
    const languageName = this.node.attrs.language;
    if (languageName === this.languageName) return;
    this.dom.language = languageName;
    const language = this.loader.load(languageName != null ? languageName : "");
    language.then((lang) => {
      if (lang) {
        this.cm.dispatch({
          effects: this.languageConf.reconfigure(lang)
        });
        this.languageName = languageName;
      }
    });
  }
  setSelection(anchor, head) {
    if (!this.cm.dom.isConnected) return;
    this.cm.focus();
    this.updating = true;
    this.cm.dispatch({ selection: { anchor, head } });
    this.updating = false;
  }
  update(node) {
    if (node.type !== this.node.type) return false;
    if (this.updating) return true;
    this.node = node;
    this.updateLanguage();
    if (this.view.editable === this.cm.state.readOnly) {
      this.cm.dispatch({
        effects: this.readOnlyConf.reconfigure(
          EditorState.readOnly.of(!this.view.editable)
        )
      });
    }
    const change = computeChange(this.cm.state.doc.toString(), node.textContent);
    if (change) {
      this.updating = true;
      this.cm.dispatch({
        changes: { from: change.from, to: change.to, insert: change.text }
      });
      this.updating = false;
    }
    return true;
  }
  selectNode() {
    this.dom.selected = true;
    this.cm.focus();
  }
  deselectNode() {
    this.dom.selected = false;
  }
  stopEvent() {
    return true;
  }
  destroy() {
    this.cm.destroy();
  }
}
function computeChange(oldVal, newVal) {
  if (oldVal === newVal) return null;
  let start = 0;
  let oldEnd = oldVal.length;
  let newEnd = newVal.length;
  while (start < oldEnd && oldVal.charCodeAt(start) === newVal.charCodeAt(start))
    ++start;
  while (oldEnd > start && newEnd > start && oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)) {
    oldEnd--;
    newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}

class LanguageLoader {
  constructor(languages) {
    this.languages = languages;
    this.map = {};
    languages.forEach((language) => {
      language.alias.forEach((alias) => {
        this.map[alias] = language;
      });
    });
  }
  getAll() {
    return this.languages.map((language) => {
      return {
        name: language.name,
        alias: language.alias
      };
    });
  }
  load(languageName) {
    const languageMap = this.map;
    const language = languageMap[languageName.toLowerCase()];
    if (!language) return Promise.resolve(void 0);
    if (language.support) return Promise.resolve(language.support);
    return language.load();
  }
}

const codeComponent = ({
  selected = false,
  codemirror,
  getAllLanguages,
  setLanguage,
  language,
  config,
  isEditorReadonly
}) => {
  var _a, _b, _c;
  const host = useHost();
  const triggerRef = useRef();
  const pickerRef = useRef();
  const searchRef = useRef();
  const [filter, setFilter] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const root = useMemo(() => host.current.getRootNode(), [host]);
  useEffect(() => {
    var _a2;
    const lang = (_a2 = getAllLanguages == null ? void 0 : getAllLanguages()) == null ? void 0 : _a2.find(
      (languageInfo) => languageInfo.alias.some(
        (alias) => alias.toLowerCase() === (language == null ? void 0 : language.toLowerCase())
      )
    );
    if (lang && lang.name !== language) setLanguage == null ? void 0 : setLanguage(lang.name);
  }, [language]);
  useEffect(() => {
    setShowPicker(false);
  }, [language]);
  useEffect(() => {
    const clickHandler = (e) => {
      const target = e.target;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      const picker = pickerRef.current;
      if (!picker) return;
      if (picker.dataset.expanded !== "true") return;
      if (!picker.contains(target)) setShowPicker(false);
    };
    root.addEventListener("click", clickHandler);
    return () => {
      root.removeEventListener("click", clickHandler);
    };
  }, []);
  useLayoutEffect(() => {
    setFilter("");
    const picker = triggerRef.current;
    const languageList = pickerRef.current;
    if (!picker || !languageList) return;
    computePosition(picker, languageList, {
      placement: "bottom-start"
    }).then(({ x, y }) => {
      Object.assign(languageList.style, {
        left: `${x}px`,
        top: `${y}px`
      });
    });
  }, [showPicker]);
  const languages = useMemo(() => {
    var _a2;
    if (!showPicker) return [];
    const all = (_a2 = getAllLanguages == null ? void 0 : getAllLanguages()) != null ? _a2 : [];
    const selected2 = all.find(
      (languageInfo) => languageInfo.name.toLowerCase() === (language == null ? void 0 : language.toLowerCase())
    );
    const filtered = all.filter((languageInfo) => {
      return (languageInfo.name.toLowerCase().includes(filter.toLowerCase()) || languageInfo.alias.some(
        (alias) => alias.toLowerCase().includes(filter.toLowerCase())
      )) && languageInfo !== selected2;
    });
    if (filtered.length === 0) return [];
    if (!selected2) return filtered;
    return [selected2, ...filtered];
  }, [filter, showPicker, language]);
  const changeFilter = (e) => {
    const target = e.target;
    setFilter(target.value);
  };
  const onTogglePicker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditorReadonly == null ? void 0 : isEditorReadonly()) return;
    setShowPicker((show) => {
      if (!show) {
        setTimeout(() => {
          var _a2;
          return (_a2 = searchRef.current) == null ? void 0 : _a2.focus();
        }, 0);
      }
      return !show;
    });
  };
  const onClear = (e) => {
    e.preventDefault();
    setFilter("");
  };
  const onSearchKeydown = (e) => {
    if (e.key === "Escape") setFilter("");
  };
  const onListKeydown = (e) => {
    if (e.key === "Enter") {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.dataset.language)
        setLanguage == null ? void 0 : setLanguage(active.dataset.language);
    }
  };
  const renderedLanguageList = useMemo(() => {
    if (!(languages == null ? void 0 : languages.length))
      return html`<li class="language-list-item no-result">
        ${config == null ? void 0 : config.noResultText}
      </li>`;
    return languages.map(
      (languageInfo) => {
        var _a2;
        return html`<li
          role="listitem"
          tabindex="0"
          class="language-list-item"
          aria-selected=${languageInfo.name.toLowerCase() === (language == null ? void 0 : language.toLowerCase())}
          data-language=${languageInfo.name}
          onclick=${() => setLanguage == null ? void 0 : setLanguage(languageInfo.name)}
        >
          ${(_a2 = config == null ? void 0 : config.renderLanguage) == null ? void 0 : _a2.call(
          config,
          languageInfo.name,
          languageInfo.name.toLowerCase() === (language == null ? void 0 : language.toLowerCase())
        )}
        </li>`;
      }
    );
  }, [languages]);
  return html`<host class=${clsx(selected && "selected")}>
    <div class="tools">
      <button
        type="button"
        ref=${triggerRef}
        class="language-button"
        onpointerdown=${onTogglePicker}
        data-expanded=${showPicker}
      >
        ${language || "Text"}
        <div class="expand-icon">${(_a = config == null ? void 0 : config.expandIcon) == null ? void 0 : _a.call(config)}</div>
      </button>
      <div
        ref=${pickerRef}
        data-expanded=${showPicker}
        class=${clsx("language-picker", showPicker && "show")}
      >
        <div class="list-wrapper">
          <div class="search-box">
            <div class="search-icon">${(_b = config == null ? void 0 : config.searchIcon) == null ? void 0 : _b.call(config)}</div>
            <input
              ref=${searchRef}
              class="search-input"
              placeholder=${config == null ? void 0 : config.searchPlaceholder}
              value=${filter}
              oninput=${changeFilter}
              onkeydown=${onSearchKeydown}
            />
            <div
              class=${clsx("clear-icon", filter.length === 0 && "hidden")}
              onmousedown=${onClear}
            >
              ${(_c = config == null ? void 0 : config.clearSearchIcon) == null ? void 0 : _c.call(config)}
            </div>
          </div>
          <ul class="language-list" role="listbox" onkeydown=${onListKeydown}>
            ${renderedLanguageList}
          </ul>
        </div>
      </div>
    </div>
    <div class="codemirror-host">${h(codemirror == null ? void 0 : codemirror.dom, {})}</div>
  </host>`;
};
codeComponent.props = {
  selected: Boolean,
  codemirror: Object,
  language: String,
  getAllLanguages: Function,
  setLanguage: Function,
  isEditorReadonly: Function,
  config: Object
};
const CodeElement = c(codeComponent);

defIfNotExists("milkdown-code-block", CodeElement);
const codeBlockView = $view(
  codeBlockSchema.node,
  (ctx) => {
    const config = ctx.get(codeBlockConfig.key);
    const languageLoader = new LanguageLoader(config.languages);
    return (node, view, getPos) => new CodeMirrorBlock(node, view, getPos, languageLoader, config);
  }
);
withMeta(codeBlockView, {
  displayName: "NodeView<code-block>",
  group: "CodeBlock"
});

const codeBlockComponent = [
  codeBlockView,
  codeBlockConfig
];

export { codeBlockComponent, codeBlockConfig, codeBlockView, defaultConfig };
//# sourceMappingURL=index.es.js.map
