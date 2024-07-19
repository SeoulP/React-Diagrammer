import {describe, test, expect} from 'bun:test'
import {hexToIColor} from "./IColorConverter.ts";

describe('Color tests', () => {
    test ('Color tests', () => {
        const iColor = hexToIColor('#efefef');

        expect(iColor).toBe({hex: '#efefef', rgb: {r: 239, g: 239, b: 239, a: 1}, hsv: {h: 0, s: 0, v: 94, a: 0}});
    })
})