import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
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
    it.todo("should not overwrite doc");
    it.todo("should throw an error");
    it.todo("should acknowledge the message");
  });

  describe("create new doc", () => {
    it.todo("should create a new doc");
    it.todo("should acknowledge the message");
  });
});
