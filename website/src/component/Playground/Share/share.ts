/* Copyright 2021, Milkdown by Mirone. */
import { compressToBase64, decompressFromBase64 } from 'lz-string'

export const encode = compressToBase64

export const decode = decompressFromBase64
