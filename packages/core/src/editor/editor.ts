import remark from 'remark';
import type { EditorView } from 'prosemirror-view';
import type { Atom } from '../abstract';
import { LoadState } from '../constant';
import {
    InputRulesLoader,
    KeymapLoader,
    NodeViewsLoader,
    ParserLoader,
    SchemaLoader,
    SerializerLoader,
    ViewLoader,
    ViewLoaderOptions,
} from '../loader';
import type { AnyRecord } from '../utility';
import type { CompleteContext } from './context';

export class Editor {
    #atoms: Atom[] = [];
    #ctx: AnyRecord = {
        loadState: LoadState.Idle,
        remark: remark(),
        nodes: [],
        marks: [],
        editor: this,
        prosemirrorPlugins: [],
    };

    #updateCtx = (value: AnyRecord) => {
        Object.assign(this.#ctx, value);
    };

    #injectCtx() {
        this.#atoms.forEach((atom) => atom.injectContext(this.#ctx as CompleteContext, this.#updateCtx));
    }

    #runAtomByLoadState(loadState: LoadState) {
        this.#atoms
            .filter((atom) => atom.loadAfter === loadState)
            .forEach((atom) => {
                atom.main();
            });
    }

    #addAtom(atom: Atom) {
        const i = this.#atoms.findIndex((a) => a.id === atom.id);
        if (i >= 0) {
            console.warn(`Atom: ${atom.id} is conflicted with previous atom, the previous one will be override.`);
            this.#atoms.splice(i, 1);
        }
        this.#atoms.push(atom);
    }

    constructor(options: Partial<ViewLoaderOptions>) {
        const viewOptions: ViewLoaderOptions = {
            root: document.body,
            defaultValue: '',
            listener: {},
            ...options,
        };
        this.use([
            new SchemaLoader(),
            new ParserLoader(),
            new SerializerLoader(),
            new KeymapLoader(),
            new InputRulesLoader(),
            new NodeViewsLoader(),
            new ViewLoader(viewOptions),
        ]);
    }

    use(atom: Atom | Atom[]) {
        if (Array.isArray(atom)) {
            atom.forEach((a) => {
                this.#addAtom(a);
            });
            return this;
        }
        this.#addAtom(atom);
        return this;
    }

    create() {
        this.#injectCtx();
        [LoadState.Idle, LoadState.LoadSchema, LoadState.SchemaReady, LoadState.LoadPlugin, LoadState.Complete].forEach(
            (state) => {
                this.#ctx.loadState = state;
                this.#runAtomByLoadState(state);
            },
        );
    }

    get view(): EditorView {
        const ctx = this.#ctx as CompleteContext;
        return ctx.editorView;
    }
}
