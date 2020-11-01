import { BadRequestError } from "@flickswipe/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { User } from "../../../models/user";
import { UserCreatedListener } from "../user-created";

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
  describe("existing doc", () => {
    it("should not overwrite doc", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      try {
        await listener.onMessage(
          {
            id,
            email: "new@user.com",
            createdAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );
      } catch (err) {
        // ignore
      }

      const existingDoc = await User.findOne({ _id: id });

      expect(existingDoc).toEqual(
        expect.objectContaining({ id, email: "test@user.com" })
      );
    });

    it("should throw an error", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      await expect(() =>
        listener.onMessage(
          {
            id,
            email: "new@user.com",
            createdAt: new Date(new Date().getTime() + 86600),
          },
          msg
        )
      ).rejects.toThrowError(BadRequestError);
    });
    it("should acknowledge the message", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      try {
        await listener.onMessage(
          {
            id,
            email: "new@user.com",
            createdAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );
      } catch (err) {
        // ignore
      }

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("create new doc", () => {
    it("should create a new doc", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: mongoose.Types.ObjectId().toHexString(),
          email: "test@user.com",
          createdAt: new Date(),
        },
        msg
      );

      const newDoc = await User.findOne({ email: "test@user.com" });

      expect(newDoc).toEqual(
        expect.objectContaining({ email: "test@user.com" })
      );
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: mongoose.Types.ObjectId().toHexString(),
          email: "test@user.com",
          createdAt: new Date(),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
