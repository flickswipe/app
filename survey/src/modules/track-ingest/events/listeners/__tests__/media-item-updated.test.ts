import { Message } from "node-nats-streaming";
import { MediaItem } from "../../../models/media-item";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemUpdatedListener } from "../media-item-updated";
import cloneDeep from "clone-deep";

// sample data
import {
  MEDIA_ITEM_A,
  MEDIA_ITEM_A_NEW,
} from "../../../../../test/sample-data/media-items";

const EVENT_DATA = {
  id: MEDIA_ITEM_A_NEW.id,
  tmdbMovieId: MEDIA_ITEM_A_NEW.tmdbMovieId,
  imdbId: MEDIA_ITEM_A_NEW.imdbId,
  title: MEDIA_ITEM_A_NEW.title,
  images: MEDIA_ITEM_A_NEW.images,
  genres: MEDIA_ITEM_A_NEW.genres,
  rating: MEDIA_ITEM_A_NEW.rating,
  language: MEDIA_ITEM_A_NEW.language,
  releaseDate: MEDIA_ITEM_A_NEW.releaseDate,
  runtime: MEDIA_ITEM_A_NEW.runtime,
  plot: MEDIA_ITEM_A_NEW.plot,
  streamLocations: MEDIA_ITEM_A_NEW.streamLocations,
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
          expect.objectContaining(cloneDeep(MEDIA_ITEM_A_NEW))
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
        expect.objectContaining(cloneDeep(MEDIA_ITEM_A_NEW))
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
