/* Copyright 2021, Milkdown by Mirone. */
declare let docsearch: (options: unknown) => void;

declare module 'builddocs' {
  interface Config {
    name: string;
    filename: string;
    format?: 'markdown' | 'html';
    main?: string;
    mainText?: string;
    anchorPrefix?: string;
    templates?: string;
  }
  export function build(config: Config): string
}

declare module '*.md' {
  const content: string;
  export default content;
}

declare module 'lz-string' {
  export function compressToBase64(input: string): string;
  export function decompressFromBase64(input: string): string;

  export function compressToUTF16(input: string): string;
  export function decompressFromUTF16(compressed: string): string;

  export function compressToUint8Array(uncompressed: string): Uint8Array;
  export function decompressFromUint8Array(compressed: Uint8Array): string;

  export function compressToEncodedURIComponent(input: string): string;
  export function decompressFromEncodedURIComponent(compressed: string): string;

  export function compress(input: string): string;
  export function decompress(compressed: string): string;
}
