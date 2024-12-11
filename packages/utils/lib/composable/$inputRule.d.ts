import type { Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { InputRule } from '@milkdown/prose/inputrules';
export type $InputRule = MilkdownPlugin & {
    inputRule: InputRule;
};
export declare function $inputRule(inputRule: (ctx: Ctx) => InputRule): $InputRule;
export declare function $inputRuleAsync(inputRule: (ctx: Ctx) => Promise<InputRule>, timerName?: string): import("./utils").WithTimer<$InputRule>;
//# sourceMappingURL=$inputRule.d.ts.map