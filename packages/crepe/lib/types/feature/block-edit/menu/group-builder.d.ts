import type { MenuItem } from './utils';
export declare class GroupBuilder {
    #private;
    clear: () => this;
    addGroup: (key: string, label: string) => {
        group: {
            key: string;
            label: string;
            items: Omit<MenuItem, "index">[];
        };
        addItem: (key: string, item: Omit<MenuItem, "key" | "index">) => /*elided*/ any;
        clear: () => /*elided*/ any;
    };
    getGroup: (key: string) => {
        group: {
            key: string;
            label: string;
            items: Omit<MenuItem, "index">[];
        };
        addItem: (key: string, item: Omit<MenuItem, "key" | "index">) => /*elided*/ any;
        clear: () => /*elided*/ any;
    };
    build: () => {
        key: string;
        label: string;
        items: Omit<MenuItem, "index">[];
    }[];
}
//# sourceMappingURL=group-builder.d.ts.map