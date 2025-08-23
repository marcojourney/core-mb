import { normalize } from "../src/phone.number.helper";

describe("phone.number.helper", () => {
  describe("normalize", () => {
    it("should return empty string for null/undefined/empty input", () => {
      expect(normalize("")).toBe("");
      expect(normalize(null as unknown as string)).toBe("");
      expect(normalize(undefined as unknown as string)).toBe("");
    });

    it("should keep leading + and strip non-digit characters", () => {
      expect(normalize("+1 (234) 567-8900")).toBe("+12345678900");
      expect(normalize("+855 12-345-678")).toBe("+85512345678");
    });

    it("should remove all non-digits if no leading +", () => {
      expect(normalize("0123-456-789")).toBe("0123456789");
      expect(normalize("(012) 345 6789")).toBe("0123456789");
    });

    it("should handle already clean input", () => {
      expect(normalize("+85512345678")).toBe("+85512345678");
      expect(normalize("0123456789")).toBe("0123456789");
    });

    it("should not duplicate + signs", () => {
      expect(normalize("++855-123-456")).toBe("+855123456");
    });
  });
});
