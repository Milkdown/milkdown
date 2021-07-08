const rgbShorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
const rgbRegex = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

const parse16 = (x: string) => parseInt(x, 16);

const hex2rgb = (hex: string) => {
    const fullHex = hex.slice(1).replace(rgbShorthandRegex, (_, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const [ok, r, g, b] = fullHex.match(rgbRegex) || [];

    return ok ? [r, g, b].map(parse16) : null;
};

export const themeColor = (hex: string) => {
    const rgb = hex2rgb(hex);
    if (!rgb) {
        console.warn(`Invalid hex: ${hex}`);
        return hex;
    }

    return rgb.join(', ');
};
