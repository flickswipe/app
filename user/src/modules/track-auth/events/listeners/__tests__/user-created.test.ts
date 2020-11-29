import { BadRequestError } from "@flickswipe/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { User } from "../../../models/user";
import { UserCreatedListener } from "../user-created";

// sample data
import { USER_A } from "../../../../../test/sample-data/users";
const EVENT_DATA = {
  id: USER_A.id,
  email: USER_A.email,
  createdAt: new Date(new Date().getTime() + 86600),
};

const setup = async () => {
  return {
    listener: new UserCreatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("user created listener", () => {
  describe("user exists", () => {
    beforeEach(async () => {
      await User.build(USER_A).save();
    });

    it("should not overwrite user", async () => {
      const { listener, msg } = await setup();

      try {
        await listener.onMessage(EVENT_DATA, msg);
      } catch (err) {
        // do nothing, tested below
      }

      // has not been overwritten
      expect(await User.findById(EVENT_DATA.id)).toEqual(
        expect.objectContaining(USER_A)
      );
    });

    it("should throw error", async () => {
      const { listener, msg } = await setup();

      // throws error
      await expect(() =>
        listener.onMessage(EVENT_DATA, msg)
      ).rejects.toThrowError(BadRequestError);
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      try {
        await listener.onMessage(EVENT_DATA, msg);
      } catch (err) {
        // do nothing, tested above
      }

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("no user exists", () => {
    it("should create user", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
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
