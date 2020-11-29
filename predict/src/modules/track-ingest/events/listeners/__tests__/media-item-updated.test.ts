import { Message } from "node-nats-streaming";
import { MediaItem } from "../../../models/media-item";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemUpdatedListener } from "../media-item-updated";

// sample data
import { MEDIA_ITEM_A } from "../../../../../test/sample-data/media-items";
const EVENT_DATA = Object.assign({}, MEDIA_ITEM_A, {
  name: "New Name",
  updatedAt: new Date(new Date().getTime() + 86600),
});
const STALE_EVENT_DATA = Object.assign({}, EVENT_DATA, {
  updatedAt: new Date(new Date().getTime() - 86600),
});

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
  describe("media item exists", () => {
    describe("data received out of order", () => {
      it("should not update media item", async () => {
        const existingDoc = await MediaItem.build(MEDIA_ITEM_A).save();

        const { listener, msg } = await setup();
        await listener.onMessage(STALE_EVENT_DATA, msg);

        // has not been overwritten
        expect(await MediaItem.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            title: existingDoc.title,
            updatedAt: existingDoc.updatedAt,
          })
        );

        // no extra records inserted
        expect(await MediaItem.countDocuments()).toBe(1);
      });

      it("should acknowledge the message", async () => {
        await MediaItem.build(MEDIA_ITEM_A).save();

        const { listener, msg } = await setup();
        await listener.onMessage(STALE_EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("data received in order", () => {
      it("should update media item", async () => {
        const existingDoc = await MediaItem.build(MEDIA_ITEM_A).save();

        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been overwritten
        expect(await MediaItem.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            title: EVENT_DATA.title,
          })
        );

        // no extra records inserted
        expect(await MediaItem.countDocuments()).toBe(1);
      });

      it("should acknowledge the message", async () => {
        await MediaItem.build(MEDIA_ITEM_A).save();

        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });
  });

  describe("no media item exists", () => {
    it("should create media item", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
      expect(await MediaItem.findById(EVENT_DATA.id)).toEqual(
        expect.objectContaining({
          title: EVENT_DATA.title,
        })
      );

      // no extra records inserted
      expect(await MediaItem.countDocuments()).toBe(1);
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
