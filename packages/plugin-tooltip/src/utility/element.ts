/* Copyright 2021, Milkdown by Mirone. */
export const elementIsTag = (element: HTMLElement, tagName: string): boolean =>
    element.tagName === tagName.toUpperCase();

export const icon = (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'icon material-icons';
    return span;
};
