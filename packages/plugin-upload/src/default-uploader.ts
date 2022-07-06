/* Copyright 2021, Milkdown by Mirone. */
import { missingNodeInSchema } from '@milkdown/exception';
import type { Node } from '@milkdown/prose/model';

import type { Uploader } from './upload';

const readImageAsBase64 = (file: File): Promise<{ alt: string; src: string }> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener(
            'load',
            () => {
                resolve({
                    alt: file.name,
                    src: reader.result as string,
                });
            },
            false,
        );
        reader.readAsDataURL(file);
    });
};

export const defaultUploader: Uploader = async (files, schema) => {
    const imgs: File[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) {
            continue;
        }

        if (!file.type.includes('image')) {
            continue;
        }

        imgs.push(file);
    }

    const { image } = schema.nodes;
    if (!image) {
        throw missingNodeInSchema('image');
    }

    const data = await Promise.all(imgs.map((img) => readImageAsBase64(img)));

    return data.map(({ alt, src }) => image.createAndFill({ src, alt }) as Node);
};
