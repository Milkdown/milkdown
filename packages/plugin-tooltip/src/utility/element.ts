/* Copyright 2021, Milkdown by Mirone. */
export const elementIsTag = (element: HTMLElement, tagName: string): boolean =>
    element.tagName === tagName.toUpperCase();
