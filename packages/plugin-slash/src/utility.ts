import { Node, Schema } from 'prosemirror-model';
import { NodeSelection, TextSelection } from 'prosemirror-state';
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
    (fn: (schema: Schema) => Node, selectionType: 'node' | 'text' = 'text'): Action['command'] =>
    (state, dispatch) => {
        if (!dispatch) return false;

        const { selection } = state;
        const { $head } = selection;
        const node = fn(state.schema);

        const tr = state.tr.replaceWith($head.before(), $head.pos, node);
        const depth = getDepth(node);
        const sel =
            selectionType === 'node'
                ? NodeSelection.create(tr.doc, $head.before() + depth)
                : TextSelection.create(tr.doc, $head.start() + depth);

        dispatch(tr.setSelection(sel).scrollIntoView());
        return true;
    };

export const nodeExists = (name: string) => (schema: Schema) => Boolean(schema.nodes[name]);
