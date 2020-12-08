import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
// mocks
import { sendAddEmailLink } from '../../../services/send-add-email-link';
import { sendMagicLink } from '../../../services/send-magic-link';
// sample data
import { ADD_EMAIL_TOKEN_A, SIGN_IN_TOKEN_A } from '../../../test/sample-data/tokens';
import { EmailTokenCreatedListener } from '../email-token-created';

jest.mock("../../../services/send-add-email-link");
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
    it("calls sendMagicLink", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(SIGN_IN_TOKEN_A, msg);

      // has been called
      expect(sendMagicLink).toHaveBeenCalled();
    });

    it("acks the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(SIGN_IN_TOKEN_A, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("email token type: add email", () => {
    it("calls sendAddEmailLink", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(ADD_EMAIL_TOKEN_A, msg);

      // has been called
      expect(sendAddEmailLink).toHaveBeenCalled();
    });

    it("acks the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(ADD_EMAIL_TOKEN_A, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
