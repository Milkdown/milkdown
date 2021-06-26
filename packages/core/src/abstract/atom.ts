import { GetCurrentContextByState, GetNextContextByState } from '../context';
import { LoadState } from '../constant';
import { AnyRecord } from '../utility';

export abstract class Atom<
    LoadAfter extends LoadState = LoadState,
    Options extends AnyRecord = AnyRecord,
    CurrentContext extends AnyRecord = GetCurrentContextByState<LoadAfter>,
    NextContext extends AnyRecord = GetNextContextByState<LoadAfter>,
> {
    context!: Readonly<CurrentContext>;
    updateContext!: (next: Partial<NextContext>) => void;
    constructor(public readonly options: Options = {} as Options) {}
    injectContext(context: CurrentContext, updateContext: (next: Partial<NextContext>) => void) {
        this.context = context;
        this.updateContext = updateContext;
    }

    abstract readonly id: string;
    abstract readonly loadAfter: LoadAfter;
    abstract main(): void;
}
