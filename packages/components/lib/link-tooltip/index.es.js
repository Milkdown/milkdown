import { $ctx } from '@milkdown/utils';
import { html, c, useRef, useState, useEffect } from 'atomico';
import { tooltipFactory, TooltipProvider } from '@milkdown/plugin-tooltip';
import debounce from 'lodash.debounce';
import { posToDOMRect } from '@milkdown/prose';
import { linkSchema } from '@milkdown/preset-commonmark';
import clsx from 'clsx';
import { TextSelection } from '@milkdown/prose/state';
import { editorViewCtx } from '@milkdown/core';

var __defProp$3 = Object.defineProperty;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$3(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$3(a, prop, b[prop]);
    }
  return a;
};
function withMeta(plugin, meta) {
  Object.assign(plugin, {
    meta: __spreadValues$3({
      package: "@milkdown-nota/components"
    }, meta)
  });
  return plugin;
}

var __defProp$2 = Object.defineProperty;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
const defaultState = {
  mode: "preview"
};
const linkTooltipState = $ctx(__spreadValues$2({}, defaultState), "linkTooltipStateCtx");
withMeta(linkTooltipState, {
  displayName: "State<link-tooltip>",
  group: "LinkTooltip"
});
const defaultAPI = {
  addLink: () => {
  },
  editLink: () => {
  },
  removeLink: () => {
  }
};
const linkTooltipAPI = $ctx(__spreadValues$2({}, defaultAPI), "linkTooltipAPICtx");
withMeta(linkTooltipState, {
  displayName: "API<link-tooltip>",
  group: "LinkTooltip"
});
const defaultConfig = {
  linkIcon: () => "\u{1F517}",
  editButton: () => "\u270E",
  removeButton: () => "\u232B",
  confirmButton: () => html`Confirm ⏎`,
  onCopyLink: () => {
  },
  inputPlaceholder: "Paste link...",
  shouldOpenOutside: () => true,
  getActualSrc: (src) => src
};
const linkTooltipConfig = $ctx(
  __spreadValues$2({}, defaultConfig),
  "linkTooltipConfigCtx"
);
withMeta(linkTooltipState, {
  displayName: "Config<link-tooltip>",
  group: "LinkTooltip"
});

const linkPreviewTooltip = tooltipFactory("LINK_PREVIEW");
withMeta(linkPreviewTooltip[0], {
  displayName: "PreviewTooltipSpec<link-tooltip>",
  group: "LinkTooltip"
});
withMeta(linkPreviewTooltip[1], {
  displayName: "PreviewTooltipPlugin<link-tooltip>",
  group: "LinkTooltip"
});
const linkEditTooltip = tooltipFactory("LINK_EDIT");
withMeta(linkEditTooltip[0], {
  displayName: "EditTooltipSpec<link-tooltip>",
  group: "LinkTooltip"
});
withMeta(linkEditTooltip[1], {
  displayName: "EditTooltipPlugin<link-tooltip>",
  group: "LinkTooltip"
});

function findMarkPosition(mark, node, doc, from, to) {
  let markPos = { start: -1, end: -1 };
  doc.nodesBetween(from, to, (n, pos) => {
    if (markPos.start > -1) return false;
    if (markPos.start === -1 && mark.isInSet(n.marks) && node === n) {
      markPos = {
        start: pos,
        end: pos + Math.max(n.textContent.length, 1)
      };
    }
    return void 0;
  });
  return markPos;
}
function shouldShowPreviewWhenHover(ctx, view, event) {
  const $pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!$pos) return;
  const { pos } = $pos;
  const node = view.state.doc.nodeAt(pos);
  if (!node) return;
  const mark = node.marks.find(
    (mark2) => mark2.type === linkSchema.mark.type(ctx)
  );
  if (!mark) return;
  const key = linkPreviewTooltip.pluginKey();
  if (!key) return;
  return { show: true, pos, node, mark };
}

function defIfNotExists(tagName, element) {
  const current = customElements.get(tagName);
  if (current == null) {
    customElements.define(tagName, element);
    return;
  }
  if (current === element) return;
  console.warn(`Custom element ${tagName} has been defined before.`);
}

const linkPreviewComponent = ({
  config,
  src,
  onEdit,
  onRemove
}) => {
  const onClickEditButton = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit == null ? void 0 : onEdit();
  };
  const onClickRemoveButton = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove == null ? void 0 : onRemove();
  };
  const onClickPreview = (e) => {
    e.preventDefault();
    if (navigator.clipboard && src) {
      navigator.clipboard.writeText(src).then(() => {
        config == null ? void 0 : config.onCopyLink(src);
      }).catch((e2) => {
        throw e2;
      });
    }
  };
  return html`
    <host>
      <div class="link-preview" onmousedown=${onClickPreview}>
        <span class="link-icon"> ${config == null ? void 0 : config.linkIcon()} </span>
        <a
          href=${config == null ? void 0 : config.getActualSrc(src != null ? src : "")}
          target=${(config == null ? void 0 : config.shouldOpenOutside(src != null ? src : "")) ? "_blank" : "_self"}
          class="link-display"
          >${src}</a
        >
        <span class="button link-edit-button" onmousedown=${onClickEditButton}>
          ${config == null ? void 0 : config.editButton()}
        </span>
        <span
          class="button link-remove-button"
          onmousedown=${onClickRemoveButton}
        >
          ${config == null ? void 0 : config.removeButton()}
        </span>
      </div>
    </host>
  `;
};
linkPreviewComponent.props = {
  config: Object,
  src: String,
  onEdit: Function,
  onRemove: Function
};
const LinkPreviewElement = c(linkPreviewComponent);

var __typeError$1 = (msg) => {
  throw TypeError(msg);
};
var __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
var __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
var _content$1, _provider$1, _slice, _hovering, _onStateChange, _onMouseEnter, _onMouseLeave, _hide;
class LinkPreviewTooltip {
  // get #instance() {
  //   return this.#provider.getInstance()
  // }
  constructor(ctx, view) {
    this.ctx = ctx;
    __privateAdd$1(this, _content$1, new LinkPreviewElement());
    __privateAdd$1(this, _provider$1);
    __privateAdd$1(this, _slice);
    // #slice: Slice<LinkToolTipState> = this.ctx.use(linkTooltipState.key)
    __privateAdd$1(this, _hovering, false);
    // setRect = (rect: DOMRect) => {
    //   // this.#provider.getInstance()?.setProps({
    //   //   getReferenceClientRect: () => rect,
    //   // })
    //   this.#provider.virtualElement = {
    //     getBoundingClientRect: () => rect,
    //   }
    // }
    __privateAdd$1(this, _onStateChange, ({ mode }) => {
      if (mode === "edit") __privateGet$1(this, _hide).call(this);
    });
    __privateAdd$1(this, _onMouseEnter, () => {
      __privateSet$1(this, _hovering, true);
    });
    __privateAdd$1(this, _onMouseLeave, () => {
      __privateSet$1(this, _hovering, false);
    });
    __privateAdd$1(this, _hide, () => {
      __privateGet$1(this, _provider$1).hide();
      __privateGet$1(this, _provider$1).element.removeEventListener("mouseenter", __privateGet$1(this, _onMouseEnter));
      __privateGet$1(this, _provider$1).element.removeEventListener("mouseleave", __privateGet$1(this, _onMouseLeave));
    });
    this.show = (mark, from, to, rect) => {
      __privateGet$1(this, _content$1).config = this.ctx.get(linkTooltipConfig.key);
      __privateGet$1(this, _content$1).src = mark.attrs.href;
      __privateGet$1(this, _content$1).onEdit = () => {
        this.ctx.get(linkTooltipAPI.key).editLink(mark, from, to);
      };
      __privateGet$1(this, _content$1).onRemove = () => {
        this.ctx.get(linkTooltipAPI.key).removeLink(from, to);
        __privateGet$1(this, _hide).call(this);
      };
      __privateGet$1(this, _provider$1).show({
        getBoundingClientRect: () => rect
      });
      __privateGet$1(this, _provider$1).element.addEventListener("mouseenter", __privateGet$1(this, _onMouseEnter));
      __privateGet$1(this, _provider$1).element.addEventListener("mouseleave", __privateGet$1(this, _onMouseLeave));
    };
    this.hide = () => {
      if (__privateGet$1(this, _hovering)) return;
      __privateGet$1(this, _hide).call(this);
    };
    this.update = () => {
    };
    this.destroy = () => {
      __privateGet$1(this, _slice).off(__privateGet$1(this, _onStateChange));
      __privateGet$1(this, _provider$1).destroy();
      __privateGet$1(this, _content$1).remove();
    };
    __privateSet$1(this, _provider$1, new TooltipProvider({
      debounce: 0,
      content: __privateGet$1(this, _content$1),
      shouldShow: () => false
    }));
    __privateGet$1(this, _provider$1).update(view);
    __privateSet$1(this, _slice, ctx.use(linkTooltipState.key));
    __privateGet$1(this, _slice).on(__privateGet$1(this, _onStateChange));
  }
}
_content$1 = new WeakMap();
_provider$1 = new WeakMap();
_slice = new WeakMap();
_hovering = new WeakMap();
_onStateChange = new WeakMap();
_onMouseEnter = new WeakMap();
_onMouseLeave = new WeakMap();
_hide = new WeakMap();

defIfNotExists("milkdown-link-preview", LinkPreviewElement);
function configureLinkPreviewTooltip(ctx) {
  let linkPreviewTooltipView;
  const DELAY = 200;
  const onMouseMove = debounce((view, event) => {
    if (!linkPreviewTooltipView) return;
    if (!view.hasFocus()) return;
    const state = ctx.get(linkTooltipState.key);
    if (state.mode === "edit") return;
    const result = shouldShowPreviewWhenHover(ctx, view, event);
    if (result) {
      const position = view.state.doc.resolve(result.pos);
      const markPosition = findMarkPosition(
        result.mark,
        result.node,
        view.state.doc,
        position.before(),
        position.after()
      );
      const from = markPosition.start;
      const to = markPosition.end;
      linkPreviewTooltipView.show(
        result.mark,
        from,
        to,
        posToDOMRect(view, from, to)
      );
      return;
    }
    linkPreviewTooltipView.hide();
  }, DELAY);
  const onMouseLeave = () => {
    setTimeout(() => {
      linkPreviewTooltipView == null ? void 0 : linkPreviewTooltipView.hide();
    }, DELAY);
  };
  ctx.set(linkPreviewTooltip.key, {
    props: {
      handleDOMEvents: {
        mousemove: onMouseMove,
        mouseleave: onMouseLeave
      }
    },
    view: (view) => {
      linkPreviewTooltipView = new LinkPreviewTooltip(ctx, view);
      return linkPreviewTooltipView;
    }
  });
}

const linkEditComponent = ({
  src,
  onConfirm,
  onCancel,
  config
}) => {
  const linkInput = useRef();
  const [link, setLink] = useState(src);
  useEffect(() => {
    setLink(src != null ? src : "");
  }, [src]);
  const onConfirmEdit = () => {
    var _a, _b;
    onConfirm == null ? void 0 : onConfirm((_b = (_a = linkInput.current) == null ? void 0 : _a.value) != null ? _b : "");
  };
  const onKeydown = (e) => {
    var _a, _b;
    e.stopPropagation();
    if (e.key === "Enter") {
      onConfirm == null ? void 0 : onConfirm((_b = (_a = linkInput.current) == null ? void 0 : _a.value) != null ? _b : "");
      e.preventDefault();
    }
    if (e.key === "Escape") {
      onCancel == null ? void 0 : onCancel();
      e.preventDefault();
    }
  };
  return html`
    <host>
      <div class="link-edit">
        <input
          class="input-area"
          placeholder=${config == null ? void 0 : config.inputPlaceholder}
          ref=${linkInput}
          onkeydown=${onKeydown}
          oninput=${(e) => setLink(e.target.value)}
          value=${link}
        />
        <span
          class=${clsx("button confirm", !link && "hidden")}
          onclick=${onConfirmEdit}
        >
          ${config == null ? void 0 : config.confirmButton()}
        </span>
      </div>
    </host>
  `;
};
linkEditComponent.props = {
  config: Object,
  src: String,
  onConfirm: Function,
  onCancel: Function
};
const LinkEditElement = c(linkEditComponent);

var __defProp$1 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _content, _provider, _data, _reset, _confirmEdit, _enterEditMode;
const defaultData = {
  from: -1,
  to: -1,
  mark: null
};
class LinkEditTooltip {
  constructor(ctx, view) {
    this.ctx = ctx;
    __privateAdd(this, _content, new LinkEditElement());
    __privateAdd(this, _provider);
    __privateAdd(this, _data, __spreadValues$1({}, defaultData));
    __privateAdd(this, _reset, () => {
      __privateGet(this, _provider).hide();
      this.ctx.update(linkTooltipState.key, (state) => __spreadProps$1(__spreadValues$1({}, state), {
        mode: "preview"
      }));
      __privateSet(this, _data, __spreadValues$1({}, defaultData));
    });
    __privateAdd(this, _confirmEdit, (href) => {
      const view = this.ctx.get(editorViewCtx);
      const { from, to, mark } = __privateGet(this, _data);
      const type = linkSchema.type(this.ctx);
      if (mark && mark.attrs.href === href) {
        __privateGet(this, _reset).call(this);
        return;
      }
      const tr = view.state.tr;
      if (mark) tr.removeMark(from, to, mark);
      tr.addMark(from, to, type.create({ href }));
      view.dispatch(tr);
      __privateGet(this, _reset).call(this);
    });
    __privateAdd(this, _enterEditMode, (value, from, to) => {
      const config = this.ctx.get(linkTooltipConfig.key);
      __privateGet(this, _content).config = config;
      __privateGet(this, _content).src = value;
      this.ctx.update(linkTooltipState.key, (state) => __spreadProps$1(__spreadValues$1({}, state), {
        mode: "edit"
      }));
      const view = this.ctx.get(editorViewCtx);
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to))
      );
      __privateGet(this, _provider).show({
        getBoundingClientRect: () => posToDOMRect(view, from, to)
      });
      requestAnimationFrame(() => {
        var _a;
        (_a = __privateGet(this, _content).querySelector("input")) == null ? void 0 : _a.focus();
      });
    });
    this.update = (view) => {
      const { state } = view;
      const { selection } = state;
      if (!(selection instanceof TextSelection)) return;
      const { from, to } = selection;
      if (from === __privateGet(this, _data).from && to === __privateGet(this, _data).to) return;
      __privateGet(this, _reset).call(this);
    };
    this.destroy = () => {
      __privateGet(this, _provider).destroy();
      __privateGet(this, _content).remove();
    };
    this.addLink = (from, to) => {
      __privateSet(this, _data, {
        from,
        to,
        mark: null
      });
      __privateGet(this, _enterEditMode).call(this, "", from, to);
    };
    this.editLink = (mark, from, to) => {
      __privateSet(this, _data, {
        from,
        to,
        mark
      });
      __privateGet(this, _enterEditMode).call(this, mark.attrs.href, from, to);
    };
    this.removeLink = (from, to) => {
      const view = this.ctx.get(editorViewCtx);
      const tr = view.state.tr;
      tr.removeMark(from, to, linkSchema.type(this.ctx));
      view.dispatch(tr);
      __privateGet(this, _reset).call(this);
    };
    __privateSet(this, _provider, new TooltipProvider({
      content: __privateGet(this, _content),
      debounce: 0,
      shouldShow: () => false
    }));
    __privateGet(this, _provider).onHide = () => {
      __privateGet(this, _content).update().catch((e) => {
        throw e;
      });
      view.dom.focus({ preventScroll: true });
    };
    __privateGet(this, _provider).update(view);
    __privateGet(this, _content).onConfirm = __privateGet(this, _confirmEdit);
    __privateGet(this, _content).onCancel = __privateGet(this, _reset);
  }
}
_content = new WeakMap();
_provider = new WeakMap();
_data = new WeakMap();
_reset = new WeakMap();
_confirmEdit = new WeakMap();
_enterEditMode = new WeakMap();

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
defIfNotExists("milkdown-link-edit", LinkEditElement);
function configureLinkEditTooltip(ctx) {
  let linkEditTooltipView;
  ctx.update(linkTooltipAPI.key, (api) => __spreadProps(__spreadValues({}, api), {
    addLink: (from, to) => {
      linkEditTooltipView == null ? void 0 : linkEditTooltipView.addLink(from, to);
    },
    editLink: (mark, from, to) => {
      linkEditTooltipView == null ? void 0 : linkEditTooltipView.editLink(mark, from, to);
    },
    removeLink: (from, to) => {
      linkEditTooltipView == null ? void 0 : linkEditTooltipView.removeLink(from, to);
    }
  }));
  ctx.set(linkEditTooltip.key, {
    view: (view) => {
      linkEditTooltipView = new LinkEditTooltip(ctx, view);
      return linkEditTooltipView;
    }
  });
}

function configureLinkTooltip(ctx) {
  configureLinkPreviewTooltip(ctx);
  configureLinkEditTooltip(ctx);
}

const linkTooltipPlugin = [
  linkTooltipState,
  linkTooltipAPI,
  linkTooltipConfig,
  linkPreviewTooltip,
  linkEditTooltip
].flat();

export { configureLinkTooltip, linkEditTooltip, linkPreviewTooltip, linkTooltipAPI, linkTooltipConfig, linkTooltipPlugin, linkTooltipState };
//# sourceMappingURL=index.es.js.map
