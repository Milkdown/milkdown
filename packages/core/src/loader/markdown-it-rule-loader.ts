import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { IdleContext } from '../editor';

const markdownItRuleLoader = (id: string) =>
    class ProsemirrorPluginLoader extends Atom<LoadState.Idle, { rules: (ctx: IdleContext) => string[] }> {
        override readonly id = id;
        override readonly loadAfter = LoadState.Idle;
        override main() {
            const rules = this.options.rules(this.context);
            const md = this.context.markdownIt.enable(rules);
            this.updateContext({
                markdownIt: md,
            });
        }
    };

export const createMarkdownItRule = (id: string, rules: (ctx: IdleContext) => string[]): Atom => {
    const Factory = markdownItRuleLoader(id);
    return new Factory({ rules }) as Atom;
};
