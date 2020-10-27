import { EmailTokenType } from "@flickswipe/common";
import { transporterWrapper } from "../../transporter-wrapper";
import { sendMagicLink } from "../send-magic-link";

describe("send magic link", () => {
  describe("send", () => {
    it("should call transporter.sendMail()", () => {
      sendMagicLink({
        id: "AAAAAA",
        emailTokenType: EmailTokenType.SignIn,
        email: "test@user",
        url: "https://example.com/",
        token: "AAAAAA",
        expiresAt: new Date(),
      });
      expect(transporterWrapper.sendMail).toHaveBeenCalled();
    });
  });
});
