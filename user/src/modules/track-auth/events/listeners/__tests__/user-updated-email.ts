import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
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
    it.todo("should throw an error");
    it.todo("should not acknowledge the message");
  });

  describe("ignore old data", () => {
    it.todo("should not overwrite a more recent doc");
    it.todo("should acknowledge the message");
  });

  describe("existing doc", () => {
    it.todo("should overwrite existing doc");
    it.todo("should acknowledge the message");
  });
});
