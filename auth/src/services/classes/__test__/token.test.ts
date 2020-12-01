import { Token } from "../token";

describe("Token", () => {
  describe("generate", () => {
    it("generates token", async () => {
      const token = await Token.generate(6);

      // has correct format
      expect(token).toEqual(expect.stringMatching(/[A-Z0-9]{6}/));
    });
  });
});
