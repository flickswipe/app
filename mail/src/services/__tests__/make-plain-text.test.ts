import { makePlainText } from "../make-plain-text";

describe("make plain text", () => {
  it("should strip surrounding html tags", () => {
    expect(makePlainText(`<strong>test</strong>`)).toBe(`test`);
  });

  it("should strip nested html tags", () => {
    expect(makePlainText(`<strong><b>nest</b> test</strong>`)).toBe(
      `nest test`
    );
  });

  it("should strip malformed nested html tags", () => {
    expect(makePlainText(`<b><strong>nest</b> test</strong>`)).toBe(
      `nest test`
    );
  });

  it("should strip surrounding invalid html tags", () => {
    expect(makePlainText(`<heading>test</heading>`)).toBe(`test`);
  });

  it("should strip nested invalid html tags", () => {
    expect(makePlainText(`<heading><bold>nest</bold> test</heading>`)).toBe(
      `nest test`
    );
  });

  it("should strip malformed nested invalid html tags", () => {
    expect(makePlainText(`<bold><heading>nest</bold> test</heading>`)).toBe(
      `nest test`
    );
  });

  it("should strip surrounding html tags with attributes", () => {
    expect(makePlainText(`<strong data-test="<<</'/>>>">test</strong>`)).toBe(
      `test`
    );
  });

  it("should strip nested html tags with attributes", () => {
    expect(
      makePlainText(
        `<strong data-test="<<</'/>>>"><b data-test="<<</'/>>>">nest</b> test</strong>`
      )
    ).toBe(`nest test`);
  });

  it("should strip malformed nested html tags with attributes", () => {
    expect(
      makePlainText(
        `<b data-test="<<</'/>>>"><strong data-test="<<</'/>>>">nest</b> test</strong>`
      )
    ).toBe(`nest test`);
  });

  it("should strip surrounding invalid html tags with attributes", () => {
    expect(makePlainText(`<heading data-test="<<</'/>>>">test</heading>`)).toBe(
      `test`
    );
  });

  it("should strip nested invalid html tags with attributes", () => {
    expect(
      makePlainText(
        `<heading data-test="<<</'/>>>"><bold data-test="<<</'/>>>">nest</bold> test</heading>`
      )
    ).toBe(`nest test`);
  });

  it("should strip malformed nested invalid html tags with attributes", () => {
    expect(
      makePlainText(
        `<bold data-test="<<</'/>>>"><heading data-test="<<</'/>>>">nest</bold> test</heading>`
      )
    ).toBe(`nest test`);
  });

  it("should strip html tags (in midst of text)", () => {
    expect(makePlainText(`aaaa <strong>test</strong> bbbb`)).toBe(
      `aaaa test bbbb`
    );
  });

  it("should strip nested html tags (in midst of text)", () => {
    expect(makePlainText(`aaaa <strong><b>nest</b> test</strong> bbbb`)).toBe(
      `aaaa nest test bbbb`
    );
  });

  it("should strip malformed nested html tags (in midst of text)", () => {
    expect(makePlainText(`aaaa <b><strong>nest</b> test</strong> bbbb`)).toBe(
      `aaaa nest test bbbb`
    );
  });

  it("should strip invalid html tags (in midst of text)", () => {
    expect(makePlainText(`aaaa <heading>test</heading> bbbb`)).toBe(
      `aaaa test bbbb`
    );
  });

  it("should strip nested invalid html tags (in midst of text)", () => {
    expect(
      makePlainText(`aaaa <heading><bold>nest</bold> test</heading> bbbb`)
    ).toBe(`aaaa nest test bbbb`);
  });

  it("should strip malformed nested invalid html tags (in midst of text)", () => {
    expect(
      makePlainText(`aaaa <bold><heading>nest</bold> test</heading> bbbb`)
    ).toBe(`aaaa nest test bbbb`);
  });

  it("should strip surrounding html tags with attributes (in midst of text)", () => {
    expect(
      makePlainText(`aaaa <strong data-test="<<</'/>>>">test</strong> bbbb`)
    ).toBe(`aaaa test bbbb`);
  });

  it("should strip nested html tags with attributes (in midst of text)", () => {
    expect(
      makePlainText(
        `aaaa <strong data-test="<<</'/>>>"><b data-test="<<</'/>>>">nest</b> test</strong> bbbb`
      )
    ).toBe(`aaaa nest test bbbb`);
  });

  it("should strip malformed nested html tags with attributes (in midst of text)", () => {
    expect(
      makePlainText(
        `aaaa <b data-test="<<</'/>>>"><strong data-test="<<</'/>>>">nest</b> test</strong> bbbb`
      )
    ).toBe(`aaaa nest test bbbb`);
  });

  it("should strip surrounding invalid html tags with attributes (in midst of text)", () => {
    expect(
      makePlainText(`aaaa <heading data-test="<<</'/>>>">test</heading> bbbb`)
    ).toBe(`aaaa test bbbb`);
  });

  it("should strip nested invalid html tags with attributes (in midst of text)", () => {
    expect(
      makePlainText(
        `aaaa <heading data-test="<<</'/>>>"><bold data-test="<<</'/>>>">nest</bold> test</heading> bbbb`
      )
    ).toBe(`aaaa nest test bbbb`);
  });

  it("should strip malformed nested invalid html tags with attributes (in midst of text)", () => {
    expect(
      makePlainText(
        `aaaa <bold data-test="<<</'/>>>"><heading data-test="<<</'/>>>">nest</bold> test</heading> bbbb`
      )
    ).toBe(`aaaa nest test bbbb`);
  });

  it("should preserve links", () => {
    expect(
      makePlainText(`aaaa <a href="http://example.com/">test</a> bbbb`, true)
    ).toBe(`aaaa <a href="http://example.com/">test</a> bbbb`);
  });

  it("should preserve links, but strip inner tags", () => {
    expect(
      makePlainText(
        `aaaa <a href="http://example.com/"><strong>test</strong></a> bbbb`,
        true
      )
    ).toBe(`aaaa <a href="http://example.com/">test</a> bbbb`);
  });

  it("should preserve links, but strip non href attrs", () => {
    expect(
      makePlainText(
        `aaaa <a href="http://example.com/" data-test="simple-test">test</a> bbbb`,
        true
      )
    ).toBe(`aaaa <a href="http://example.com/">test</a> bbbb`);
  });

  it("should preserve multiple links", () => {
    expect(
      makePlainText(
        `aaaa <a href="http://example.com/"><strong>test</strong></a> bbbb <a href="http://example.com/"><strong>test 2</strong></a> cccc`,
        true
      )
    ).toBe(
      `aaaa <a href="http://example.com/">test</a> bbbb <a href="http://example.com/">test 2</a> cccc`
    );
  });

  it("should preserve indentical links", () => {
    expect(
      makePlainText(
        `aaaa <a href="http://example.com/"><strong>test</strong></a> bbbb <a href="http://example.com/"><strong>test</strong></a> cccc`,
        true
      )
    ).toBe(
      `aaaa <a href="http://example.com/">test</a> bbbb <a href="http://example.com/">test</a> cccc`
    );
  });

  it.each([`aaaa\nbbbb`, `aaaa\rbbbb`])(
    "should preserve spaces that fall across lines",
    (text) => {
      expect(makePlainText(text)).toBe(`aaaa bbbb`);
    }
  );

  it.each([
    "address",
    "article",
    "aside",
    "blockquote",
    "details",
    "dialog",
    "dd",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "ul",
  ])("should insert whitespace after <%s> tags", (tag) => {
    expect(makePlainText(`aaaa <${tag}>bbbb</${tag}> cccc`)).toBe(
      `aaaa\nbbbb\ncccc`
    );
  });

  it("should insert whitespace after <br> tags", () => {
    expect(makePlainText(`aaaa <br />bbbb<br /> cccc`)).toBe(
      `aaaa\nbbbb\ncccc`
    );
  });

  it("should insert whitespace after <hr> tags", () => {
    expect(makePlainText(`aaaa <hr />bbbb<hr /> cccc`)).toBe(
      `aaaa\n\nbbbb\n\ncccc`
    );
  });

  it("should insert whitespace around <table> markup", () => {
    expect(
      makePlainText(
        `aaaa <table><tr><td>cell</td><td>cell 2</td></tr></table> cccc`
      )
    ).toBe(`aaaa\n\ncell\tcell 2\n\ncccc`);
  });
});
