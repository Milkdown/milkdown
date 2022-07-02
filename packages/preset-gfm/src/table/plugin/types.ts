/* Copyright 2021, Milkdown by Mirone. */

export type getFromDOM<T> = (dom: Element) => T;
export type setDOMAttr = <Value>(value: Value, attrs: Record<string, unknown>) => void;

export interface CellAttributes<T = unknown> {
    default: T;
    getFromDOM?: getFromDOM<T>;
    setDOMAttr?: setDOMAttr;
}

export interface TableNodesOptions {
    tableGroup?: string;
    cellContent: string;
    cellAttributes: { [key: string]: CellAttributes };
}
