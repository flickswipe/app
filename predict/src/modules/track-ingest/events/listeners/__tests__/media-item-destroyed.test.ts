import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemDestroyedListener } from "../media-item-destroyed";
import { MediaItem } from "../../../models/media-item";

// sample data
import { MEDIA_ITEM_A } from "../../../../../test/sample-data/media-items";

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

      await MediaItem.build(MEDIA_ITEM_A).save();

      await listener.onMessage(
        {
          id: MEDIA_ITEM_A.id,
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been deleted
      expect(
        await MediaItem.findOne({
          _id: MEDIA_ITEM_A.id,
        })
      ).toBeNull();
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await MediaItem.build(MEDIA_ITEM_A).save();

      await listener.onMessage(
        {
          id: MEDIA_ITEM_A.id,
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
