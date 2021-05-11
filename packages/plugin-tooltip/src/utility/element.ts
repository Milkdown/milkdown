export const elementIsTag = (element: HTMLElement, tagName: string): boolean =>
    element.tagName === tagName.toUpperCase();

export const icon = (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'icon material-icons material-icons-outlined';
    return span;
};

export const input = (): HTMLDivElement => {
    const div = document.createElement('div');
    div.className = 'group';
    const inputEl = document.createElement('input');
    inputEl.className = 'icon input';
    const confirm = icon('check_circle');
    div.appendChild(inputEl);
    div.appendChild(confirm);

    return div;
};
