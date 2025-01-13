import type { Ctx } from "@milkdown/kit/ctx";
import { TooltipProvider } from "@milkdown/kit/plugin/tooltip";
import type { EditorState, PluginView } from "@milkdown/kit/prose/state";
import { NodeSelection } from "@milkdown/kit/prose/state";
import type { EditorView } from "@milkdown/kit/prose/view";
import { mathInlineId } from "../inline-latex";
import { LatexInlineEditElement } from "./component";

export class LatexInlineTooltip implements PluginView {
  #content = new LatexInlineEditElement()
  #provider: TooltipProvider

  constructor(readonly ctx: Ctx, view: EditorView) {
    this.#provider = new TooltipProvider({
      debounce: 0,
      content: this.#content,
      shouldShow: this.#shouldShow,
    })
    this.#provider.update(view)
  }

  #shouldShow = (view: EditorView) => {
    const selection = view.state.selection
    if (selection.empty) return false

    if (!(selection instanceof NodeSelection)) return false;

    const node = selection.node;
    if (node.type.name !== mathInlineId) return false

    return true;
  }

  update = (view: EditorView, prevState?: EditorState) => {
    this.#provider.update(view, prevState)
  }

  destroy = () => {
    this.#provider.destroy()
    this.#content.remove()
  }
}
