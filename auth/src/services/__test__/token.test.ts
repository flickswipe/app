import { Token } from "../../services/token";

describe("Token", () => {
  describe("#generate", () => {
    it("generates a token of expected length", async () => {
      const token = await Token.generate(6);

      expect(token).toEqual(expect.stringMatching(/[A-Z0-9]{6}/));
    });
  });
});
