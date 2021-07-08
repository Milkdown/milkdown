export const query = (_: unknown, width: string) => {
    return {
        [`@media only screen and (min-width: ${width})`]: {
            '@mixin-content': {},
        },
    };
};
