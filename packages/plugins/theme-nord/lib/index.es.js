import { editorViewOptionsCtx as s } from "@milkdown/core";
import i from "clsx";
function c(e) {
  e.update(s, (r) => {
    const o = r.attributes;
    return {
      ...r,
      attributes: (n) => {
        const t = typeof o == "function" ? o(n) : o;
        return {
          ...t,
          class: i("prose dark:prose-invert outline-none", (t == null ? void 0 : t.class) || "", "milkdown-theme-nord")
        };
      }
    };
  });
}
export {
  c as nord
};
//# sourceMappingURL=index.es.js.map
