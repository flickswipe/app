import { ADD_EMAIL_TOKEN_A } from "../../test/sample-data/tokens";
import { transporterWrapper } from "../../transporter-wrapper";
import { sendAddEmailLink } from "../send-add-email-link";

describe("send add email link", () => {
  describe("send", () => {
    it("should send email", () => {
      sendAddEmailLink(ADD_EMAIL_TOKEN_A);

      // has been sent
      expect(transporterWrapper.sendMail).toHaveBeenCalled();
    });
  });
});
