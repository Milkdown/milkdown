/* Copyright 2021, Milkdown by Mirone. */

const toBinary = (string: string): string => {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
    }
    const charCodes = new Uint8Array(codeUnits.buffer);
    let result = '';
    for (let i = 0; i < charCodes.byteLength; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result += String.fromCharCode(charCodes[i]!);
    }
    return result;
};

export const encode = (string: string): string => btoa(toBinary(string));

const fromBinary = (binary: string): string => {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    const charCodes = new Uint16Array(bytes.buffer);
    let result = '';
    for (let i = 0; i < charCodes.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result += String.fromCharCode(charCodes[i]!);
    }
    return result;
};

export const decode = (string: string): string => fromBinary(atob(string));
