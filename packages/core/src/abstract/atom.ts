import { AtomType, LoadState } from '../constant';
import { AnyRecord } from '../utility';

export abstract class Atom<
    CurrentContext extends AnyRecord = AnyRecord,
    NextContext extends AnyRecord = CurrentContext,
    Options extends AnyRecord = AnyRecord
> {
    context!: CurrentContext;
    updateContext!: (next: Partial<NextContext>) => void;
    constructor(public readonly options: Options = {} as Options) {}
    injectContext(context: CurrentContext, updateContext: (next: Partial<NextContext>) => void) {
        this.context = context;
        this.updateContext = updateContext;
    }

    abstract readonly id: string;
    abstract readonly type: AtomType;
    abstract readonly loadAfter: LoadState;
    abstract main(): void;
}
