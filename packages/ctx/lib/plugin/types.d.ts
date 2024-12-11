import type { Meta } from '../inspector';
import type { Ctx } from './ctx';
export type Cleanup = () => void | Promise<void>;
export type RunnerReturnType = void | Promise<void> | Cleanup | Promise<Cleanup>;
export type CtxRunner = () => RunnerReturnType;
export type MilkdownPlugin = {
    meta?: Meta;
} & ((ctx: Ctx) => CtxRunner);
//# sourceMappingURL=types.d.ts.map