import { SIGN_IN_TOKEN_A } from "../../test/sample-data/tokens";
import { transporterWrapper } from "../../transporter-wrapper";
import { sendMagicLink } from "../send-magic-link";

describe("send magic link", () => {
  describe("send", () => {
    it("should send email", () => {
      sendMagicLink(SIGN_IN_TOKEN_A);

      // has been sent
      expect(transporterWrapper.sendMail).toHaveBeenCalled();
    });
  });
});
