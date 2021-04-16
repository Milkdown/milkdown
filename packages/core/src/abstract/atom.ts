enum AtomType {
    ProsemirrorSpec,
    ProsemirrorPlugin,
    MarkdownItOption,
    MarkdownItPlugin,
    Theme,
    Listener,
}

export enum LoadState {
    Idle,
    SchemaReady,
    TransformerReady,
    PluginReady,
    EditorReady,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export abstract class Atom<
    CurrentContext extends AnyRecord,
    NextContext extends AnyRecord = CurrentContext,
    Options extends AnyRecord = AnyRecord
> {
    constructor(
        protected readonly context: CurrentContext,
        protected readonly updateContext: () => Partial<NextContext>,
        protected readonly option: Options,
    ) {}

    abstract readonly id: string | symbol;
    abstract type: AtomType;
    abstract loadAfter: LoadState;
    abstract main(): void;
}
