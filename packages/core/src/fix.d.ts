/* Copyright 2021, Milkdown by Mirone. */
import 'prosemirror-model';
declare module 'prosemirror-model' {
    interface Node {
        withText(text: string): Node & { text: string };
    }
}
