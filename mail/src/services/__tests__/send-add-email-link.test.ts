import { EmailTokenType } from "@flickswipe/common";
import { transporterWrapper } from "../../transporter-wrapper";
import { sendAddEmailLink } from "../send-add-email-link";

describe("send add email link", () => {
  describe("send", () => {
    it("should call transporter.sendMail()", () => {
      sendAddEmailLink({
        id: "AAAAAA",
        emailTokenType: EmailTokenType.AddEmail,
        email: "test@user",
        url: "https://example.com/",
        token: "AAAAAA",
        expiresAt: new Date(),
      });
      expect(transporterWrapper.sendMail).toHaveBeenCalled();
    });
  });
});
