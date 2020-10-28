import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemUpdatedListener } from "../media-item-updated";

const setup = async () => {
  return {
    listener: new MediaItemUpdatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("media item updated listener", () => {
  describe("ignore old data", () => {
    it.todo("should not overwrite a more recent doc");
    it.todo("should acknowledge the message");
  });

  describe("update existing doc", () => {
    it.todo("should overwrite existing doc");
    it.todo("should update stream location collection");
    it.todo("should update language collection");
    it.todo("should acknowledge the message");
  });

  describe("create new doc", () => {
    it.todo("should create a new doc");
    it.todo("should update stream location collection");
    it.todo("should update language collection");
    it.todo("should acknowledge the message");
  });
});
