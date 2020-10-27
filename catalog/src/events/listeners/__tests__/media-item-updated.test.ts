import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
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
  it.todo("should remove associated media item");
});
