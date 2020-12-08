import cloneDeep from 'clone-deep';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../../../nats-wrapper';
// sample data
import { MEDIA_ITEM_A, MEDIA_ITEM_A_NEW } from '../../../../../test/sample-data/media-items';
import { MediaItem } from '../../../models/media-item';
import { MediaItemUpdatedListener } from '../media-item-updated';

const EVENT_DATA = {
  id: MEDIA_ITEM_A_NEW.id,
  tmdbMovieId: MEDIA_ITEM_A_NEW.tmdbMovieId,
  imdbId: MEDIA_ITEM_A_NEW.imdbId,
  title: MEDIA_ITEM_A_NEW.title,
  images: MEDIA_ITEM_A_NEW.images,
  genres: MEDIA_ITEM_A_NEW.genres,
  rating: MEDIA_ITEM_A_NEW.rating,
  audioLanguage: MEDIA_ITEM_A_NEW.audioLanguage,
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

const expectCorrectMediaItemData = async (id: string, data: any) => {
  const mediaItemData = (await MediaItem.findById(id)).toJSON();
  const correctData = expect.objectContaining(cloneDeep(data));

  expect(mediaItemData).toEqual(correctData);
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
        await expectCorrectMediaItemData(EVENT_DATA_STALE.id, MEDIA_ITEM_A);
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
        await expectCorrectMediaItemData(EVENT_DATA_STALE.id, MEDIA_ITEM_A_NEW);
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
      await expectCorrectMediaItemData(EVENT_DATA_STALE.id, MEDIA_ITEM_A_NEW);
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
