import { BadRequestError } from "@flickswipe/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { User } from "../../../models/user";
import { UserUpdatedEmailListener } from "../user-updated-email";

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
  describe("non-existing doc", () => {
    it("should throw an error", async () => {
      const { listener, msg } = await setup();

      await expect(() =>
        listener.onMessage(
          {
            id: mongoose.Types.ObjectId().toHexString(),
            email: "new@user.com",
            updatedAt: new Date(new Date().getTime() + 86600),
          },
          msg
        )
      ).rejects.toThrowError(BadRequestError);
    });
    it("should not acknowledge the message", async () => {
      const { listener, msg } = await setup();

      try {
        await listener.onMessage(
          {
            id: mongoose.Types.ObjectId().toHexString(),
            email: "new@user.com",
            updatedAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );
      } catch (err) {
        // ignore
      }
      expect(msg.ack).not.toHaveBeenCalled();
    });
  });

  describe("ignore old data", () => {
    it("should not overwrite a more recent doc", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id,
          email: "new@user.com",
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      const existingDoc = await User.findOne({ _id: id });

      expect(existingDoc).toEqual(
        expect.objectContaining({ id, email: "test@user.com" })
      );
    });
    it("should acknowledge the message", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id,
          email: "new@user.com",
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("existing doc", () => {
    it("should overwrite existing doc", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id,
          email: "new@user.com",
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      const existingDoc = await User.findOne({ _id: id });

      expect(existingDoc).toEqual(
        expect.objectContaining({ id, email: "new@user.com" })
      );
    });

    it("should acknowledge the message", async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      await User.build({
        id,
        email: "test@user.com",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id,
          email: "new@user.com",
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
