export interface IColor {
    hex: string;
    rgb: IColorRgb;
    hsv: IColorHsv;
}

export interface IColorRgb {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface IColorHsv {
    h: number;
    s: number;
    v: number;
    a: number;
}

function hexToRgb(hex: string): IColorRgb {
    let r = 0, g = 0, b = 0;

    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }

    return { r, g, b, a: 1 };
}

function rgbToHsv({ r, g, b, a }: IColorRgb): IColorHsv {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100, a };
}

export function hexToIColor(hex: string): IColor {
    const rgb = hexToRgb(hex);
    const hsv = rgbToHsv(rgb);

    return {
        hex,
        rgb,
        hsv
    };
}