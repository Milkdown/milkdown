import { $ctx, $view } from '@milkdown/utils';
import { html, c, useRef, useState } from 'atomico';
import { imageSchema } from '@milkdown/preset-commonmark';
import clsx from 'clsx';

var __defProp = Object.defineProperty;
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
function withMeta(plugin, meta) {
  Object.assign(plugin, {
    meta: __spreadValues({
      package: "@milkdown/components"
    }, meta)
  });
  return plugin;
}

const defaultInlineImageConfig = {
  imageIcon: () => "\u{1F30C}",
  uploadButton: () => html`Upload`,
  confirmButton: () => html`⏎`,
  uploadPlaceholderText: "/Paste",
  onUpload: (file) => Promise.resolve(URL.createObjectURL(file))
};
const inlineImageConfig = $ctx(defaultInlineImageConfig, "inlineImageConfigCtx");
withMeta(inlineImageConfig, {
  displayName: "Config<image-inline>",
  group: "ImageInline"
});

function defIfNotExists(tagName, element) {
  const current = customElements.get(tagName);
  if (current == null) {
    customElements.define(tagName, element);
    return;
  }
  if (current === element)
    return;
  console.warn(`Custom element ${tagName} has been defined before.`);
}

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const inlineImageComponent = ({
  src = "",
  selected = false,
  alt,
  title,
  setAttr,
  config
}) => {
  const linkInput = useRef();
  const [uuid] = useState(crypto.randomUUID());
  const [focusLinkInput, setFocusLinkInput] = useState(false);
  const [hidePlaceholder, setHidePlaceholder] = useState(src.length !== 0);
  const [currentLink, setCurrentLink] = useState(src);
  const onEditLink = (e) => {
    const target = e.target;
    const value = target.value;
    setHidePlaceholder(value.length !== 0);
    setCurrentLink(value);
  };
  const onUpload = (e) => __async(void 0, null, function* () {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file)
      return;
    const url = yield config == null ? void 0 : config.onUpload(file);
    if (!url)
      return;
    setAttr == null ? void 0 : setAttr("src", url);
    setHidePlaceholder(true);
  });
  const onConfirmLinkInput = () => {
    var _a, _b;
    setAttr == null ? void 0 : setAttr("src", (_b = (_a = linkInput.current) == null ? void 0 : _a.value) != null ? _b : "");
  };
  const onKeydown = (e) => {
    if (e.key === "Enter")
      onConfirmLinkInput();
  };
  const preventDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onClickUploader = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  return html`<host class=${clsx(selected && "selected", !src && "empty")}>
    ${!src ? html`<div class="empty-image-inline">
        <div class="image-icon">
          ${config == null ? void 0 : config.imageIcon()}
        </div>
        <div class=${clsx("link-importer", focusLinkInput && "focus")}>
          <input
            draggable="true"
            ref=${linkInput}
            ondragstart=${preventDrag}
            class="link-input-area"
            value=${currentLink}
            oninput=${onEditLink}
            onkeydown=${onKeydown}
            onfocus=${() => setFocusLinkInput(true)}
            onblur=${() => setFocusLinkInput(false)}
          />
          <div class=${clsx("placeholder", hidePlaceholder && "hidden")}>
            <input class="hidden" id=${uuid} type="file" accept="image/*" onchange=${onUpload} />
            <label onpointerdown=${onClickUploader} class="uploader" for=${uuid}>
              ${config == null ? void 0 : config.uploadButton()}
            </label>
            <span class="text" onclick=${() => {
    var _a;
    return (_a = linkInput.current) == null ? void 0 : _a.focus();
  }}>
              ${config == null ? void 0 : config.uploadPlaceholderText}
            </span>
          </div>
        </div>
        <div
          class=${clsx("confirm", currentLink.length === 0 && "hidden")}
          onclick=${() => onConfirmLinkInput()}
        >
          ${config == null ? void 0 : config.confirmButton()}
        </div>
      </div>` : html`<img class="image-inline" src=${src} alt=${alt} title=${title} />`}
  </host>`;
};
inlineImageComponent.props = {
  src: String,
  alt: String,
  title: String,
  selected: Boolean,
  setAttr: Function,
  config: Object
};
const InlineImageElement = c(inlineImageComponent);

defIfNotExists("milkdown-image-inline", InlineImageElement);
const inlineImageView = $view(imageSchema.node, (ctx) => {
  return (initialNode, view, getPos) => {
    const dom = document.createElement("milkdown-image-inline");
    const config = ctx.get(inlineImageConfig.key);
    const bindAttrs = (node) => {
      dom.src = node.attrs.src;
      dom.alt = node.attrs.alt;
      dom.title = node.attrs.title;
    };
    bindAttrs(initialNode);
    dom.selected = false;
    dom.setAttr = (attr, value) => {
      const pos = getPos();
      if (pos == null)
        return;
      view.dispatch(view.state.tr.setNodeAttribute(pos, attr, value));
    };
    dom.config = config;
    return {
      dom,
      update: (updatedNode) => {
        if (updatedNode.type !== initialNode.type)
          return false;
        bindAttrs(updatedNode);
        return true;
      },
      stopEvent: (e) => {
        if (dom.selected && e.target instanceof HTMLInputElement)
          return true;
        return false;
      },
      selectNode: () => {
        dom.selected = true;
      },
      deselectNode: () => {
        dom.selected = false;
      },
      destroy: () => {
        dom.remove();
      }
    };
  };
});
withMeta(inlineImageView, {
  displayName: "NodeView<image-inline>",
  group: "ImageInline"
});

const imageInlineComponent = [
  inlineImageConfig,
  inlineImageView
];

export { defaultInlineImageConfig, imageInlineComponent, inlineImageConfig, inlineImageView };
//# sourceMappingURL=index.es.js.map
