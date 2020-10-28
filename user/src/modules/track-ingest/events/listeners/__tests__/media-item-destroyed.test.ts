import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemDestroyedListener } from "../media-item-destroyed";
import { MediaItem } from "../../../models/media-item";

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
  describe("remove associated media item", () => {
    it("should delete doc", async () => {
      const { listener, msg } = await setup();

      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        releaseDate: new Date(),
        runtime: 103,
        genres: [Types.ObjectId().toHexString()],
        streamLocations: [Types.ObjectId().toHexString()],
        language: Types.ObjectId().toHexString(),
      }).save();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
        },
        msg
      );

      // has been deleted
      expect(
        await MediaItem.findOne({
          _id: "ab1234567890ab1234567890",
        })
      ).toBeNull();
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        releaseDate: new Date(),
        runtime: 103,
        genres: [Types.ObjectId().toHexString()],
        streamLocations: [Types.ObjectId().toHexString()],
        language: Types.ObjectId().toHexString(),
      }).save();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
