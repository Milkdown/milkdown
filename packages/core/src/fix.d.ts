/* Copyright 2021, Milkdown by Mirone. */
import '@milkdown/prose';
declare module '@milkdown/prose' {
    class Node {
        withText(text: string): Node & { text: string };
    }
}
