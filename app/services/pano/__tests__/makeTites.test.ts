import { nearestNumber, analyzeImagesLevel } from "../../workers/tilesGenerate";

describe("make tiles test - analyzeImagesLevel", () => {
    it("nearestNumber get number", () => {
        const inputs = [1500, 8000, 10000, 12000, 13000, 14000, 20000];
        const ouputs = [1472, 8000, 9984, 12032, 12992, 14016, 20032];

        for (let i = 0; i < inputs.length; i++) {
            expect(nearestNumber(inputs[i])).toBe(ouputs[i]);
        }
    });

    it("analyzeImagesLevel get level", () => {
        const inputs = [1500, 8000, 10000, 12000, 13000, 14000, 20000];
        const levels = [1, 3, 4, 4, 4, 4, 5];
        for (let i = 0; i < inputs.length; i++) {
            const result = analyzeImagesLevel(inputs[i]);
            console.info(result);
            expect(result).toHaveLength(levels[i]);
        }
    });
});
