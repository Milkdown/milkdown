import type { Node, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import type { Action } from './item';

export const createDropdown = () => {
    const div = document.createElement('div');
    div.setAttribute('role', 'listbox');
    div.setAttribute('tabindex', '-1');
    div.classList.add('slash-dropdown');
    div.classList.add('hide');

    return div;
};

type ItemOptions = {
    iconClassName: string;
    textClassName: string;
};
export const createDropdownItem = (text: string, icon: string, options?: Partial<ItemOptions>) => {
    const iconClassName = options?.iconClassName ?? 'icon material-icons material-icons-outlined';
    const textClassName = options?.textClassName ?? 'text';

    const div = document.createElement('div');
    div.setAttribute('role', 'option');
    div.classList.add('slash-dropdown-item');

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.className = iconClassName;

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.className = textClassName;

    div.appendChild(iconSpan);
    div.appendChild(textSpan);

    return div;
};

export const getDepth = (node: Node) => {
    let cur = node;
    let depth = 0;
    while (cur.childCount) {
        cur = cur.child(0);
        depth += 1;
    }

    return depth;
};

export const cleanUpAndCreateNode =
    (fn: (schema: Schema) => Node): Action['command'] =>
    (schema: Schema) =>
    (state, dispatch) => {
        if (!dispatch) return false;

        const { selection } = state;
        const { $head } = selection;
        const start = $head.pos - 1 - $head.parent.content.size;
        const node = fn(schema);
        const tr = state.tr.replaceWith(start, $head.pos, node);
        const pos = start + getDepth(node) + 1;
        const sel = TextSelection.create(tr.doc, pos);
        dispatch(tr.setSelection(sel).scrollIntoView());
        return true;
    };

export const nodeExists = (name: string) => (schema: Schema) => Boolean(schema.nodes[name]);
