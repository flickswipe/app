import { unifyISO6391 } from "../unify-iso6391";

describe.only("ISO 630 1", () => {
  it("should unify language name (capitalized)", () => {
    expect(unifyISO6391("English")).toBe("en");
    expect(unifyISO6391("Chinese")).toBe("zh");
  });

  it("should unify language name (lowercase)", () => {
    expect(unifyISO6391("english")).toBe("en");
    expect(unifyISO6391("chinese")).toBe("zh");
  });

  it("should unify language name (random case)", () => {
    expect(unifyISO6391("EnGlIsH")).toBe("en");
    expect(unifyISO6391("CHiNeSe")).toBe("zh");
  });

  it("should unify language two-letter code", () => {
    expect(unifyISO6391("en")).toBe("en");
    expect(unifyISO6391("zh")).toBe("zh");
  });

  it("should unify language four-letter code", () => {
    expect(unifyISO6391("en-US")).toBe("en");
    expect(unifyISO6391("en-GB")).toBe("en");
    expect(unifyISO6391("zh-CN")).toBe("zh");
    expect(unifyISO6391("zh-SG")).toBe("zh");
  });

  it("should unify malformed language four-letter code", () => {
    expect(unifyISO6391("en-CN")).toBe("en");
    expect(unifyISO6391("en-SG")).toBe("en");
    expect(unifyISO6391("zh-US")).toBe("zh");
    expect(unifyISO6391("zh-GB")).toBe("zh");
  });

  it("should return null on malformed content", () => {
    expect(unifyISO6391("some random string")).toBeNull();
    expect(unifyISO6391("en-")).toBeNull();
    expect(unifyISO6391("-GB")).toBeNull();
    expect(unifyISO6391("e")).toBeNull();
  });
});
