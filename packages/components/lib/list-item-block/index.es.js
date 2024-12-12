import { $ctx, $view } from '@milkdown/utils';
import { TextSelection } from '@milkdown/prose/state';
import { listItemSchema } from '@milkdown/preset-commonmark';
import { c, useHost, useRef, useLayoutEffect, html } from 'atomico';

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

function defIfNotExists(tagName, element) {
  const current = customElements.get(tagName);
  if (current == null) {
    customElements.define(tagName, element);
    return;
  }
  if (current === element) return;
  console.warn(`Custom element ${tagName} has been defined before.`);
}

const listItemComponent = ({
  selected,
  label = "",
  listType = "",
  checked,
  onMount,
  setAttr,
  config,
  readonly
}) => {
  const host = useHost();
  const contentWrapperRef = useRef();
  useLayoutEffect(() => {
    const current = contentWrapperRef.current;
    if (!current) return;
    const contentDOM = host.current.querySelector("[data-content-dom]");
    if (contentDOM) {
      current.appendChild(contentDOM);
      onMount == null ? void 0 : onMount();
    }
  }, []);
  const onClickLabel = () => {
    if (checked == null) return;
    setAttr == null ? void 0 : setAttr("checked", !checked);
  };
  const labelProps = {
    label,
    listType,
    checked,
    readonly
  };
  return html`<host class=${selected && "ProseMirror-selectednode"}>
    <li class="list-item">
      <div
        class="label-wrapper"
        onclick=${onClickLabel}
        contenteditable="false"
      >
        ${config == null ? void 0 : config.renderLabel(labelProps)}
      </div>
      <div class="children" ref=${contentWrapperRef}></div>
    </li>
  </host>`;
};
listItemComponent.props = {
  label: String,
  checked: Boolean,
  readonly: Boolean,
  listType: String,
  config: Object,
  selected: Boolean,
  setAttr: Function,
  onMount: Function
};
const ListItemElement = c(listItemComponent);

const defaultListItemBlockConfig = {
  renderLabel: ({ label, listType, checked, readonly }) => {
    if (checked == null)
      return html`<span class="label"
        >${listType === "bullet" ? "\u29BF" : label}</span
      >`;
    return html`<input
      disabled=${readonly}
      class="label"
      type="checkbox"
      checked=${checked}
    />`;
  }
};
const listItemBlockConfig = $ctx(
  defaultListItemBlockConfig,
  "listItemBlockConfigCtx"
);
withMeta(listItemBlockConfig, {
  displayName: "Config<list-item-block>",
  group: "ListItemBlock"
});

defIfNotExists("milkdown-list-item-block", ListItemElement);
const listItemBlockView = $view(
  listItemSchema.node,
  (ctx) => {
    return (initialNode, view, getPos) => {
      const dom = document.createElement(
        "milkdown-list-item-block"
      );
      const contentDOM = document.createElement("div");
      contentDOM.setAttribute("data-content-dom", "true");
      contentDOM.classList.add("content-dom");
      const config = ctx.get(listItemBlockConfig.key);
      const bindAttrs = (node2) => {
        dom.listType = node2.attrs.listType;
        dom.label = node2.attrs.label;
        dom.checked = node2.attrs.checked;
        dom.readonly = !view.editable;
      };
      bindAttrs(initialNode);
      dom.appendChild(contentDOM);
      dom.selected = false;
      dom.setAttr = (attr, value) => {
        const pos = getPos();
        if (pos == null) return;
        view.dispatch(view.state.tr.setNodeAttribute(pos, attr, value));
      };
      dom.onMount = () => {
        const { anchor, head } = view.state.selection;
        if (view.hasFocus()) {
          Promise.resolve().then(() => {
            const anchorPos = view.state.doc.resolve(anchor);
            const headPos = view.state.doc.resolve(head);
            view.dispatch(
              view.state.tr.setSelection(new TextSelection(anchorPos, headPos))
            );
          });
        }
      };
      let node = initialNode;
      dom.config = config;
      return {
        dom,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type !== initialNode.type) return false;
          if (updatedNode.sameMarkup(node) && updatedNode.content.eq(node.content))
            return true;
          node = updatedNode;
          bindAttrs(updatedNode);
          return true;
        },
        ignoreMutation: (mutation) => {
          if (!dom || !contentDOM) return true;
          if (mutation.type === "selection") return false;
          if (contentDOM === mutation.target && mutation.type === "attributes")
            return true;
          if (contentDOM.contains(mutation.target)) return false;
          return true;
        },
        selectNode: () => {
          dom.selected = true;
        },
        deselectNode: () => {
          dom.selected = false;
        },
        destroy: () => {
          dom.remove();
          contentDOM.remove();
        }
      };
    };
  }
);
withMeta(listItemBlockView, {
  displayName: "NodeView<list-item-block>",
  group: "ListItemBlock"
});

const listItemBlockComponent = [
  listItemBlockConfig,
  listItemBlockView
];

export { ListItemElement, defaultListItemBlockConfig, listItemBlockComponent, listItemBlockConfig, listItemBlockView, listItemComponent };
//# sourceMappingURL=index.es.js.map
