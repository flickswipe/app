import { BadRequestError } from "@flickswipe/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { User } from "../../../models/user";
import { UserUpdatedEmailListener } from "../user-updated-email";

// sample data
import { USER_A } from "../../../../../test/sample-data/users";
const EVENT_DATA = {
  id: USER_A.id,
  email: USER_A.email,
  updatedAt: new Date(new Date().getTime() + 86600),
};
const EVENT_DATA_STALE = Object.assign({}, EVENT_DATA, {
  updatedAt: new Date(new Date().getTime() - 86600),
});

const setup = async () => {
  return {
    listener: new UserUpdatedEmailListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("user updated email listener", () => {
  describe("no user exists", () => {
    it("should throw error", async () => {
      const { listener, msg } = await setup();

      // throws error
      await expect(() =>
        listener.onMessage(EVENT_DATA, msg)
      ).rejects.toThrowError(BadRequestError);
    });

    it("should not acknowledge the message", async () => {
      const { listener, msg } = await setup();

      try {
        await listener.onMessage(EVENT_DATA, msg);
      } catch (err) {
        // do nothing, tested above
      }

      // has not been acked
      expect(msg.ack).not.toHaveBeenCalled();
    });
  });

  describe("user exists", () => {
    beforeEach(async () => {
      await User.build(USER_A).save();
    });

    describe("data received out of order", () => {
      it("should not overwrite user", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_STALE, msg);

        // has not been overwritten
        expect(await User.findById(EVENT_DATA.id)).toEqual(
          expect.objectContaining(USER_A)
        );
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_STALE, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("data received in order", () => {
      it("should overwrite user", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been updated
        expect(await User.findById(EVENT_DATA.id)).toEqual(
          expect.objectContaining(USER_A)
        );
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });
  });
});
