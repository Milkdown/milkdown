import 'prosemirror-model';
declare module 'prosemirror-model' {
    interface Node {
        withText(text: string): Node & { text: string };
    }
}
