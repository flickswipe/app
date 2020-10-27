import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { MediaItemDestroyedListener } from "../media-item-destroyed";

const setup = async () => {
  return {
    listener: new MediaItemDestroyedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("media item destroyed listener", () => {
  it.todo("should remove associated media item");
});
