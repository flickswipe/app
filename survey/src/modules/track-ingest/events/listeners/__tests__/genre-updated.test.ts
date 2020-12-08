import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../../../nats-wrapper';
// sample data
import { GENRE_A, GENRE_A_NEW } from '../../../../../test/sample-data/genres';
import { Genre, GenreDoc } from '../../../models/genre';
import { GenreUpdatedListener } from '../genre-updated';

const EVENT_DATA = {
  id: GENRE_A_NEW.id,
  tmdbGenreId: GENRE_A_NEW.tmdbGenreId,
  name: GENRE_A_NEW.name,
  updatedAt: new Date(new Date().getTime() + 86600),
};
const EVENT_DATA_STALE = Object.assign({}, EVENT_DATA, {
  updatedAt: new Date(new Date().getTime() - 86600),
});

const setup = async () => {
  return {
    listener: new GenreUpdatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("genre detected listener", () => {
  describe("genre exists", () => {
    let existingDoc: GenreDoc;
    beforeEach(async () => {
      existingDoc = await Genre.build(GENRE_A).save();
    });

    describe("data received out of order", () => {
      it("should not overwrite", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_STALE, msg);

        // has not been overwritten
        expect(await Genre.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            tmdbGenreId: GENRE_A.tmdbGenreId,
            name: GENRE_A.name,
          })
        );

        // no extra inserts
        expect(await Genre.countDocuments()).toBe(1);
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_STALE, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("data recieved in order", () => {
      it("should overwrite", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been overwritten
        expect(await Genre.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            tmdbGenreId: GENRE_A_NEW.tmdbGenreId,
            name: GENRE_A_NEW.name,
          })
        );

        // no extra inserts
        expect(await Genre.countDocuments()).toBe(1);
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });
  });

  describe("no genre exists", () => {
    it("should create genre", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
      expect(await Genre.findOne({})).toEqual(
        expect.objectContaining({
          tmdbGenreId: GENRE_A_NEW.tmdbGenreId,
          name: GENRE_A_NEW.name,
        })
      );

      // no extra inserts
      expect(await Genre.countDocuments()).toBe(1);
    });
  });

  it("should acknowledge the message", async () => {
    const { listener, msg } = await setup();
    await listener.onMessage(EVENT_DATA, msg);

    // has been acked
    expect(msg.ack).toHaveBeenCalled();
  });
});
