import { Context, contexts, createContainer, Meta } from '../context';
import { parserPlugin, schemaLoader, serializerLoader, viewLoader } from '../internal-plugin';

export type Ctx = {
    get: <T>(meta: Meta<T>) => Context<T>;
};

export type Plugin = (ctx: Ctx) => void | Promise<void>;

export class Editor {
    #container = createContainer();
    #ctx: Ctx = {
        get: this.#container.getCtx,
    };
    #plugins: Set<(ctx: Ctx) => void> = new Set();

    constructor() {
        [schemaLoader, parserPlugin, serializerLoader, viewLoader].forEach(this.use);
        contexts.forEach((x) => this.ctx<unknown>(x));
    }

    ctx = <T>(meta: Meta<T>) => {
        meta(this.#container.container);
        return this;
    };

    use = (plugins: Plugin | Plugin[]) => {
        if (Array.isArray(plugins)) {
            plugins.forEach((plugin) => {
                this.#plugins.add(plugin);
            });
            return this;
        }

        this.#plugins.add(plugins);
        return this;
    };

    create() {
        this.#plugins.forEach((loader) => {
            loader(this.#ctx);
        });
    }
}
