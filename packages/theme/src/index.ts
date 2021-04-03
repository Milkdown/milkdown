type BG = CSSStyleDeclaration['backgroundColor'];
type Font = CSSStyleDeclaration['fontFamily'];
type TextSize = CSSStyleDeclaration['fontSize'];
type TextColor = CSSStyleDeclaration['color'];

interface ThemeUnit {
    bg: BG;
    font: Font;
    textSize: TextSize;
    textColor: TextColor;
}

type PThemeUnit = Partial<ThemeUnit>;

type Headings = `h${1 | 2 | 3 | 4 | 5}`;
type Nodes = 'quote' | 'codeFence' | 'li' | 'list' | 'ol' | 'ul' | 'heading' | Headings;
type Marks = 'link' | 'strong' | 'codeInline' | 'em';

type ThemeOptions = ThemeUnit & Partial<Record<Nodes | Marks, PThemeUnit>>;

export function createTheme(element: HTMLElement, options: ThemeOptions) {
    const theme = Object.entries(options).reduce((acc, [key, value]) => {
        if (typeof value === 'object') {
            return {
                ...acc,
                ...Object.entries(value).reduce(
                    (acc, [k, v]) => ({
                        ...acc,
                        [`${key}-${k}`]: v,
                    }),
                    {} as Record<string, unknown>,
                ),
            };
        }
        return {
            ...acc,
            [key]: value,
        };
    }, {} as Record<string, unknown>);

    Object.entries(theme).forEach(([key, value]) => {
        element.style.setProperty('--' + key, value as string);
    });
}
