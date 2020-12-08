import { transporterWrapper } from '../../../transporter-wrapper';
import { Email } from '../email';

const [L, R] = Email.delimiters;
const EMAIL_A = "a@test.com";

describe("email", () => {
  describe("compile", () => {
    it("should replace a key with a data value", () => {
      const compiled = Email.compile(`aaaa ${L}KEY${R} bbbb`, {
        key: "value",
      });

      // compiles correctly
      expect(compiled).toBe(`aaaa value bbbb`);
    });

    it("should replace multiple keys with data values", () => {
      const compiled = Email.compile(
        `aaaa ${L}KEY${R} bbbb ${L}KEY2${R} cccc`,
        {
          key: "value",
          key2: "value2",
        }
      );

      // compiles correctly
      expect(compiled).toBe(`aaaa value bbbb value2 cccc`);
    });

    it("should replace multiple identical keys with data values", () => {
      const compiled = Email.compile(`aaaa ${L}KEY${R} bbbb ${L}KEY${R} cccc`, {
        key: "value",
      });

      // compiles correctly
      expect(compiled).toBe(`aaaa value bbbb value cccc`);
    });

    it("shouldn't care about key case", () => {
      const compiled = Email.compile(
        `aaaa ${L}KEY${R} bbbb ${L}key${R} cccc ${L}kEy${R} dddd`,
        {
          key: "value",
        }
      );

      // compiles correctly
      expect(compiled).toBe(`aaaa value bbbb value cccc value dddd`);
    });
  });

  describe("constructor", () => {
    it("should strip html from subject template", () => {
      const email = new Email("<b>subject</b>", "<b>html</b>");
      // has no html
      expect(email.subjectTemplate).toBe("subject");
    });

    it("should strip links from subject template", () => {
      const email = new Email('<a href="test.html">subject</a>', "<b>html</b>");
      // has no links
      expect(email.subjectTemplate).toBe("subject");
    });

    it("should strip html from text template", () => {
      const email = new Email("<b>subject</b>", "<b>html</b>");
      // has no html
      expect(email.textTemplate).toBe("html");
    });

    it("shouldn't strip links from text template", () => {
      const email = new Email("subject", '<a href="test.html">link</a>');
      // has links
      expect(email.textTemplate).toBe('<a href="test.html">link</a>');
    });

    it("shouldn't strip html from html template", () => {
      const email = new Email("subject", "<b>html</b>");
      // has html
      expect(email.htmlTemplate).toBe("<b>html</b>");
    });

    it("shouldn't strip links from html template", () => {
      const email = new Email("subject", '<a href="test.html">link</a>');
      // has links
      expect(email.htmlTemplate).toBe('<a href="test.html">link</a>');
    });
  });

  describe("send", () => {
    it("should send email", () => {
      new Email("subject", "<b>html</b>").send(EMAIL_A, {});
      expect(transporterWrapper.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: EMAIL_A,
          subject: "subject",
          text: "html",
          html: "<b>html</b>",
        })
      );
    });
  });
});
