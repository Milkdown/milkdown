import type { Plugin } from 'unified';
import { Atom } from '../abstract';
import { LoadState } from '../constant';
import type { IdleContext } from '../editor';

const remarkPluginLoader = (id: string) =>
    class ProsemirrorPluginLoader extends Atom<LoadState.Idle, { plugins: (ctx: IdleContext) => Plugin[] }> {
        override readonly id = id;
        override readonly loadAfter = LoadState.Idle;
        override main() {
            const plugins = this.options.plugins(this.context);
            const md = plugins.reduce((instance, plugin) => instance.use(plugin), this.context.remark);
            this.updateContext({
                remark: md,
            });
        }
    };

export const createRemarkPlugin = (id: string, plugins: (ctx: IdleContext) => Plugin[]): Atom => {
    const Factory = remarkPluginLoader(id);
    return new Factory({ plugins }) as Atom;
};
