import { $nodeSchema, $remark, $ctx, $view } from '@milkdown/utils';
import { expectDomTypeError } from '@milkdown/exception';
import { visit } from 'unist-util-visit';
import { html, useHost, useMemo, useEffect, c, useRef, useState } from 'atomico';
import clsx from 'clsx';

var __defProp$1 = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
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
function withMeta(plugin, meta) {
  Object.assign(plugin, {
    meta: __spreadValues$1({
      package: "@milkdown/components"
    }, meta)
  });
  return plugin;
}

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
const IMAGE_DATA_TYPE = "image-block";
const imageBlockSchema = $nodeSchema("image-block", () => {
  return {
    inline: false,
    group: "block",
    selectable: true,
    draggable: true,
    isolating: true,
    marks: "",
    atom: true,
    priority: 100,
    attrs: {
      src: { default: "" },
      caption: { default: "" },
      ratio: { default: 1 }
    },
    parseDOM: [
      {
        tag: `img[data-type="${IMAGE_DATA_TYPE}"]`,
        getAttrs: (dom) => {
          var _a;
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom);
          return {
            src: dom.getAttribute("src") || "",
            caption: dom.getAttribute("caption") || "",
            ratio: Number((_a = dom.getAttribute("ratio")) != null ? _a : 1)
          };
        }
      }
    ],
    toDOM: (node) => ["img", __spreadValues({ "data-type": IMAGE_DATA_TYPE }, node.attrs)],
    parseMarkdown: {
      match: ({ type }) => type === "image-block",
      runner: (state, node, type) => {
        const src = node.url;
        const caption = node.title;
        let ratio = Number(node.alt || 1);
        if (Number.isNaN(ratio) || ratio === 0)
          ratio = 1;
        state.addNode(type, {
          src,
          caption,
          ratio
        });
      }
    },
    toMarkdown: {
      match: (node) => node.type.name === "image-block",
      runner: (state, node) => {
        state.openNode("paragraph");
        state.addNode("image", void 0, void 0, {
          title: node.attrs.caption,
          url: node.attrs.src,
          alt: `${Number.parseFloat(node.attrs.ratio).toFixed(2)}`
        });
        state.closeNode();
      }
    }
  };
});
withMeta(imageBlockSchema.node, {
  displayName: "NodeSchema<image-block>",
  group: "ImageBlock"
});

function visitImage(ast) {
  return visit(ast, "paragraph", (node, index, parent) => {
    var _a, _b;
    if (((_a = node.children) == null ? void 0 : _a.length) !== 1)
      return;
    const firstChild = (_b = node.children) == null ? void 0 : _b[0];
    if (!firstChild || firstChild.type !== "image")
      return;
    const { url, alt, title } = firstChild;
    const newNode = {
      type: "image-block",
      url,
      alt,
      title
    };
    parent.children.splice(index, 1, newNode);
  });
}
const remarkImageBlockPlugin = $remark("remark-image-block", () => () => visitImage);
withMeta(remarkImageBlockPlugin.plugin, {
  displayName: "Remark<remarkImageBlock>",
  group: "ImageBlock"
});
withMeta(remarkImageBlockPlugin.options, {
  displayName: "RemarkConfig<remarkImageBlock>",
  group: "ImageBlock"
});

const defaultImageBlockConfig = {
  imageIcon: () => "\u{1F30C}",
  captionIcon: () => "\u{1F4AC}",
  uploadButton: () => html`Upload file`,
  confirmButton: () => html`Confirm ⏎`,
  uploadPlaceholderText: "or paste the image link ...",
  captionPlaceholderText: "Image caption",
  onUpload: (file) => Promise.resolve(URL.createObjectURL(file))
};
const imageBlockConfig = $ctx(defaultImageBlockConfig, "imageBlockConfigCtx");
withMeta(imageBlockConfig, {
  displayName: "Config<image-block>",
  group: "ImageBlock"
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

function useBlockEffect({
  image,
  resizeHandle,
  ratio,
  setRatio,
  src
}) {
  const host = useHost();
  const root = useMemo(() => host.current.getRootNode(), [host]);
  useEffect(() => {
    const imageRef = image.current;
    if (!imageRef)
      return;
    delete imageRef.dataset.origin;
    delete imageRef.dataset.height;
    imageRef.style.height = "";
  }, [src]);
  useEffect(() => {
    const resizeHandleRef = resizeHandle.current;
    const imageRef = image.current;
    if (!resizeHandleRef || !imageRef)
      return;
    const onMove = (e) => {
      e.preventDefault();
      const top = imageRef.getBoundingClientRect().top;
      const height = e.clientY - top;
      const h = Number(height < 100 ? 100 : height).toFixed(2);
      imageRef.dataset.height = h;
      imageRef.style.height = `${h}px`;
    };
    const pointerUp = () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", pointerUp);
      const originHeight = Number(imageRef.dataset.origin);
      const currentHeight = Number(imageRef.dataset.height);
      const ratio2 = Number.parseFloat(Number(currentHeight / originHeight).toFixed(2));
      if (Number.isNaN(ratio2))
        return;
      setRatio(ratio2);
    };
    const pointerDown = (e) => {
      e.preventDefault();
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerup", pointerUp);
    };
    const onLoad = (e) => {
      const maxWidth = host.current.getBoundingClientRect().width;
      if (!maxWidth)
        return;
      const target = e.target;
      const height = target.height;
      const width = target.width;
      const transformedHeight = width < maxWidth ? height : maxWidth * (height / width);
      const h = (transformedHeight * ratio).toFixed(2);
      imageRef.dataset.origin = transformedHeight.toFixed(2);
      imageRef.dataset.height = h;
      imageRef.style.height = `${h}px`;
    };
    imageRef.addEventListener("load", onLoad);
    resizeHandleRef.addEventListener("pointerdown", pointerDown);
    return () => {
      imageRef.removeEventListener("load", onLoad);
      resizeHandleRef.removeEventListener("pointerdown", pointerDown);
    };
  }, []);
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
let timer = 0;
const imageComponent = ({
  src = "",
  caption = "",
  ratio = 1,
  selected = false,
  readonly = false,
  setAttr,
  config
}) => {
  const image = useRef();
  const resizeHandle = useRef();
  const linkInput = useRef();
  const [showCaption, setShowCaption] = useState(caption.length > 0);
  const [hidePlaceholder, setHidePlaceholder] = useState(src.length !== 0);
  const [uuid] = useState(crypto.randomUUID());
  const [focusLinkInput, setFocusLinkInput] = useState(false);
  const [currentLink, setCurrentLink] = useState(src);
  useBlockEffect({
    image,
    resizeHandle,
    ratio,
    setRatio: (r) => setAttr == null ? void 0 : setAttr("ratio", r),
    src
  });
  useEffect(() => {
    if (selected)
      return;
    setShowCaption(caption.length > 0);
  }, [selected]);
  const onInput = (e) => {
    const target = e.target;
    const value = target.value;
    if (timer)
      window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      setAttr == null ? void 0 : setAttr("caption", value);
    }, 1e3);
  };
  const onBlurCaption = (e) => {
    const target = e.target;
    const value = target.value;
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
    setAttr == null ? void 0 : setAttr("caption", value);
  };
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
  const onToggleCaption = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (readonly)
      return;
    setShowCaption((x) => !x);
  };
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
  return html`<host class=${clsx(selected && "selected")}>
    <div class=${clsx("image-edit", src.length > 0 && "hidden")}>
      <div class="image-icon">
        ${config == null ? void 0 : config.imageIcon()}
      </div>
      <div class=${clsx("link-importer", focusLinkInput && "focus")}>
        <input
          ref=${linkInput}
          draggable="true"
          ondragstart=${preventDrag}
          disabled=${readonly}
          class="link-input-area"
          value=${currentLink}
          oninput=${onEditLink}
          onkeydown=${onKeydown}
          onfocus=${() => setFocusLinkInput(true)}
          onblur=${() => setFocusLinkInput(false)}
        />
        <div class=${clsx("placeholder", hidePlaceholder && "hidden")}>
          <input disabled=${readonly} class="hidden" id=${uuid} type="file" accept="image/*" onchange=${onUpload} />
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
    </div>
    <div class=${clsx("image-wrapper", src.length === 0 && "hidden")}>
      <div class="operation">
        <div class="operation-item" onpointerdown=${onToggleCaption}>${config == null ? void 0 : config.captionIcon()}</div>
      </div>
      <img ref=${image} data-type=${IMAGE_DATA_TYPE} src=${src} alt=${caption} ratio=${ratio} />
      <div ref=${resizeHandle} class="image-resize-handle"></div>
    </div>
    <input
      draggable="true"
      ondragstart=${preventDrag}
      class=${clsx("caption-input", !showCaption && "hidden")}
      placeholder=${config == null ? void 0 : config.captionPlaceholderText}
      oninput=${onInput}
      onblur=${onBlurCaption}
      value=${caption}
    />
  </host>`;
};
imageComponent.props = {
  src: String,
  caption: String,
  ratio: Number,
  selected: Boolean,
  readonly: Boolean,
  setAttr: Function,
  config: Object
};
const ImageElement = c(imageComponent);

defIfNotExists("milkdown-image-block", ImageElement);
const imageBlockView = $view(imageBlockSchema.node, (ctx) => {
  return (initialNode, view, getPos) => {
    const dom = document.createElement("milkdown-image-block");
    const config = ctx.get(imageBlockConfig.key);
    const bindAttrs = (node) => {
      dom.src = node.attrs.src;
      dom.ratio = node.attrs.ratio;
      dom.caption = node.attrs.caption;
      dom.readonly = !view.editable;
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
        if (e.target instanceof HTMLInputElement)
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
withMeta(imageBlockView, {
  displayName: "NodeView<image-block>",
  group: "ImageBlock"
});

const imageBlockComponent = [
  remarkImageBlockPlugin,
  imageBlockSchema,
  imageBlockView,
  imageBlockConfig
].flat();

export { IMAGE_DATA_TYPE, defaultImageBlockConfig, imageBlockComponent, imageBlockConfig, imageBlockSchema, imageBlockView, remarkImageBlockPlugin };
//# sourceMappingURL=index.es.js.map
