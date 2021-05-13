import { Node as ProsemirrorNode } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';

export const findParentNode = (predicate: (node: ProsemirrorNode) => boolean) => (selection: Selection) => {
    const { $from } = selection;
    for (let i = $from.depth; i > 0; i--) {
        const node = $from.node(i);
        if (predicate(node)) {
            return {
                pos: i > 0 ? $from.before(i) : 0,
                start: $from.start(i),
                depth: i,
                node,
            };
        }
    }
    return undefined;
};

export const createDropdown = () => {
    const div = document.createElement('div');
    div.classList.add('slash-dropdown');

    return div;
};

export const createPlaceholder = (text: string) => {
    return document.createTextNode(text);
};

export const createDropdownItem = (text: string, icon: string) => {
    const div = document.createElement('div');
    div.classList.add('slash-dropdown-item');

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.className = 'icon material-icons material-icons-outlined';

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.className = 'text';

    div.appendChild(iconSpan);
    div.appendChild(textSpan);

    return div;
};
