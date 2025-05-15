import { describe, it, expect } from "vitest";
import { calculateTotal } from "./calculateTotal";

describe("calculateTotal", () => {
    it("sums valid numbers", () => {
        expect(calculateTotal("100,200")).toBe(300);
        expect(calculateTotal("100,200,300")).toBe(600);
    });

    it("handles whitespace", () => {
        expect(calculateTotal("100, 200, 300")).toBe(600);
    });

    it("handles new lines", () => {
        expect(calculateTotal("100\n200")).toBe(300);
        expect(calculateTotal("100\n200\n300")).toBe(600);
    });

    it("handles mixed delimiters", () => {
        expect(calculateTotal("100,200\n300")).toBe(600);
    });

    it("handles negative numbers", () => {
        expect(calculateTotal("-100,200,-300")).toBe(0);
        expect(calculateTotal("-100,200,300")).toBe(0);
    });

    it("handles empty string", () => {
        expect(calculateTotal('')).toBe(0);
        expect(calculateTotal(',\n,  ')).toBe(0);
    });

    it("handles invalid inputs", () => {
        expect(calculateTotal("abc,100,def")).toBe(0);
        expect(calculateTotal("12three\n45")).toBe(57);
        expect(calculateTotal("123.45.67")).toBe(123.45);
    });

    it("handles trailing comma", () => {
        expect(calculateTotal("100,200,")).toBe(300);
    });
})