import type { Editor } from '@milkdown/core';
import type { Ref } from 'vue';
export type Instance = [Ref<true>, () => undefined] | [Ref<false>, () => Editor];
export declare function useInstance(): Instance;
//# sourceMappingURL=useInstance.d.ts.map