import { type Ref } from 'atomico';
interface Options {
    image: Ref<HTMLImageElement>;
    resizeHandle: Ref<HTMLDivElement>;
    ratio: number;
    setRatio: (ratio: number) => void;
    src: string;
}
export declare function useBlockEffect({ image, resizeHandle, ratio, setRatio, src, }: Options): void;
export {};
//# sourceMappingURL=event.d.ts.map