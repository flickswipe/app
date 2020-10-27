import { Message } from "node-nats-streaming";
import { EmailTokenType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { EmailTokenCreatedListener } from "../email-token-created";

import { sendAddEmailLink } from "../../../services/send-add-email-link";
import { sendMagicLink } from "../../../services/send-magic-link";

// mock sendAddEmailLink
jest.mock("../../../services/send-add-email-link");

// mock sendMagicLink
jest.mock("../../../services/send-magic-link");

const setup = async () => {
  return {
    listener: new EmailTokenCreatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("email token created listener", () => {
  describe("email token type: sign in", () => {
    const data = {
      id: "AAAAAA",
      emailTokenType: EmailTokenType.SignIn,
      email: "test@user",
      url: "https://example.com/",
      token: "AAAAAA",
      expiresAt: new Date(),
    };

    it("calls sendMagicLink", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(sendMagicLink).toHaveBeenCalled();
    });

    it("acks the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("email token type: add email", () => {
    const data = {
      id: "AAAAAA",
      emailTokenType: EmailTokenType.AddEmail,
      email: "test@user",
      url: "https://example.com/",
      token: "AAAAAA",
      expiresAt: new Date(),
    };

    it("calls sendAddEmailLink", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(sendAddEmailLink).toHaveBeenCalled();
    });

    it("acks the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
