import type { Atom } from '../abstract';
import type { AnyRecord } from '../utility';

import MarkdownIt from 'markdown-it';
import { LoadState } from '../constant';
import {
    KeymapLoader,
    SchemaLoader,
    SerializerLoader,
    InputRulesLoader,
    NodeViewsLoader,
    ParserLoader,
    ViewLoader,
    ViewLoaderOptions,
} from '../loader';

export class Editor {
    private atoms: Atom[] = [];
    private ctx: AnyRecord = {
        loadState: LoadState.Idle,
        markdownIt: new MarkdownIt('commonmark'),
        nodes: [],
        marks: [],
        editor: this,
        prosemirrorPlugins: [],
    };

    private updateCtx = (value: AnyRecord) => {
        Object.assign(this.ctx, value);
    };

    private injectCtx() {
        this.atoms.forEach((atom) => atom.injectContext(this.ctx, this.updateCtx));
    }

    private runAtomByLoadState(loadState: LoadState) {
        this.atoms
            .filter((atom) => atom.loadAfter === loadState)
            .forEach((atom) => {
                atom.main();
            });
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
                this.atoms.push(a);
            });
            return this;
        }
        this.atoms.push(atom);
        return this;
    }

    create() {
        this.injectCtx();
        [
            LoadState.Idle,
            LoadState.BuildSchema,
            LoadState.SchemaReady,
            LoadState.PluginReady,
            LoadState.Complete,
        ].forEach((state) => {
            this.ctx.loadState = state;
            this.runAtomByLoadState(state);
        });
    }
}
