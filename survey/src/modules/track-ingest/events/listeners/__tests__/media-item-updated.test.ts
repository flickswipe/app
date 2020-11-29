import { Message } from "node-nats-streaming";
import { MediaItem } from "../../../models/media-item";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemUpdatedListener } from "../media-item-updated";
import cloneDeep from "clone-deep";

// sample data
import {
  MEDIA_ITEM_A,
  MEDIA_ITEM_A_OVERWRITTEN,
} from "../../../../../test/sample-data/media-items";

const EVENT_DATA = {
  id: MEDIA_ITEM_A_OVERWRITTEN.id,
  tmdbMovieId: MEDIA_ITEM_A_OVERWRITTEN.tmdbMovieId,
  imdbId: MEDIA_ITEM_A_OVERWRITTEN.imdbId,
  title: MEDIA_ITEM_A_OVERWRITTEN.title,
  images: MEDIA_ITEM_A_OVERWRITTEN.images,
  genres: MEDIA_ITEM_A_OVERWRITTEN.genres,
  rating: MEDIA_ITEM_A_OVERWRITTEN.rating,
  language: MEDIA_ITEM_A_OVERWRITTEN.language,
  releaseDate: MEDIA_ITEM_A_OVERWRITTEN.releaseDate,
  runtime: MEDIA_ITEM_A_OVERWRITTEN.runtime,
  plot: MEDIA_ITEM_A_OVERWRITTEN.plot,
  streamLocations: MEDIA_ITEM_A_OVERWRITTEN.streamLocations,
  updatedAt: new Date(new Date().getTime() + 86600),
};
const EVENT_DATA_STALE = Object.assign({}, EVENT_DATA, {
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
    beforeEach(async () => {
      await MediaItem.build(MEDIA_ITEM_A).save();
    });

    describe("data received out of order", () => {
      it("should not update media item", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_STALE, msg);

        // has not been updated
        expect(await MediaItem.findById(EVENT_DATA_STALE.id)).toEqual(
          expect.objectContaining(cloneDeep(MEDIA_ITEM_A))
        );
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_STALE, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("data received in order", () => {
      it("should update media item", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been updated
        expect(await MediaItem.findById(EVENT_DATA.id)).toEqual(
          expect.objectContaining(cloneDeep(MEDIA_ITEM_A_OVERWRITTEN))
        );
      });

      it("should acknowledge the message", async () => {
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
        expect.objectContaining(cloneDeep(MEDIA_ITEM_A_OVERWRITTEN))
      );
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
