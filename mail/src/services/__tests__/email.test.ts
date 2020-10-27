import { transporterWrapper } from "../../transporter-wrapper";
import { Email } from "../email";

const [L, R] = Email.delimiters;

describe("email", () => {
  describe("hydrate", () => {
    it("should replace a key with a data value", () => {
      const hydrated = Email.hydrate(`aaaa ${L}KEY${R} bbbb`, {
        key: "value",
      });

      expect(hydrated).toBe(`aaaa value bbbb`);
    });

    it("should replace multiple keys with data values", () => {
      const hydrated = Email.hydrate(
        `aaaa ${L}KEY${R} bbbb ${L}KEY2${R} cccc`,
        {
          key: "value",
          key2: "value2",
        }
      );

      expect(hydrated).toBe(`aaaa value bbbb value2 cccc`);
    });

    it("should replace multiple identical keys with data values", () => {
      const hydrated = Email.hydrate(`aaaa ${L}KEY${R} bbbb ${L}KEY${R} cccc`, {
        key: "value",
      });

      expect(hydrated).toBe(`aaaa value bbbb value cccc`);
    });

    it("shouldn't care about key case", () => {
      const hydrated = Email.hydrate(
        `aaaa ${L}KEY${R} bbbb ${L}key${R} cccc ${L}kEy${R} dddd`,
        {
          key: "value",
        }
      );

      expect(hydrated).toBe(`aaaa value bbbb value cccc value dddd`);
    });
  });

  describe("constructor", () => {
    it("should store subject template in class", () => {
      const email = new Email("subject", "html");
      expect(email.subjectTemplate).toBe("subject");
    });

    it("should strip html from subject template", () => {
      const email = new Email("<b>subject</b>", "<b>html</b>");
      expect(email.subjectTemplate).toBe("subject");
    });

    it("should strip links from subject template", () => {
      const email = new Email("<a href='#'>subject</a>", "<b>html</b>");
      expect(email.subjectTemplate).toBe("subject");
    });

    it("should store text template in class", () => {
      const email = new Email("subject", "html");
      expect(email.textTemplate).toBe("html");
    });

    it("should strip html from text template", () => {
      const email = new Email("<b>subject</b>", "<b>html</b>");
      expect(email.subjectTemplate).toBe("subject");
    });

    it("shouldn't strip links from text template", () => {
      const email = new Email("subject", "<a href='#'>subject</a>");
      expect(email.subjectTemplate).toBe("subject");
    });

    it("should store html template in class", () => {
      const email = new Email("subject", "html");
      expect(email.htmlTemplate).toBe("html");
    });

    it("shouldn't strip html from html template", () => {
      const email = new Email("subject", "<b>html</b>");
      expect(email.htmlTemplate).toBe("<b>html</b>");
    });
  });

  describe("send", () => {
    it("should call transporter.sendMail", () => {
      new Email("subject", "<b>html</b>").send("test@user.com", {});
      expect(transporterWrapper.sendMail).toHaveBeenCalled();
    });

    it("should call transporter.sendMail with correct arguments", () => {
      new Email("subject", "<b>html</b>").send("test@user.com", {});
      expect(transporterWrapper.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@user.com",
          subject: "subject",
          text: "html",
          html: "<b>html</b>",
        })
      );
    });
  });
});
