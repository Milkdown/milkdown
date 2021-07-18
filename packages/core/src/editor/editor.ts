import { contexts, createContainer, Meta } from '../context';
import { parser, schema, serializer, editorView, init, keymap, inputRules } from '../internal-plugin';
import { Ctx, MilkdownPlugin } from '../utility';

const internalPlugins = [schema, parser, serializer, editorView, keymap, inputRules, init];

export class Editor {
    #container = createContainer();
    #ctx: Ctx = {
        use: this.#container.getCtx,
    };
    #plugins: Set<(ctx: Ctx) => void> = new Set();

    constructor() {
        contexts.forEach((x) => this.ctx<unknown>(x));
    }

    #loadInternal = () => {
        this.use(internalPlugins);
    };

    ctx = <T>(meta: Meta<T>) => {
        meta(this.#container.contextMap);
        return this;
    };

    use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
        if (Array.isArray(plugins)) {
            plugins.forEach((plugin) => {
                this.#plugins.add(plugin(this));
            });
            return this;
        }

        this.#plugins.add(plugins(this));
        return this;
    };

    create = () => {
        this.#loadInternal();
        this.#plugins.forEach((loader) => {
            loader(this.#ctx);
        });
        return this;
    };
}
