import { Message } from "node-nats-streaming";
import { Genre, GenreDoc } from "../../../models/genre";
import { natsWrapper } from "../../../../../nats-wrapper";
import { GenreDetectedListener } from "../genre-detected";

// sample data
import { GENRE_A, GENRE_A_NEW } from "../../../../../test/sample-data/genres";
const EVENT_DATA = {
  tmdbGenreId: GENRE_A_NEW.tmdbGenreId,
  name: GENRE_A_NEW.name,
  language: GENRE_A_NEW.language,
  detectedAt: new Date(new Date().getTime() + 86600),
};
const EVENT_DATA_STALE = Object.assign({}, EVENT_DATA, {
  detectedAt: new Date(new Date().getTime() - 86600),
});

const setup = async () => {
  return {
    listener: new GenreDetectedListener(natsWrapper.client),

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
          expect.objectContaining(GENRE_A)
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
      it("should update doc", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been overwritten
        expect(await Genre.findById(existingDoc.id)).toEqual(
          expect.objectContaining(GENRE_A_NEW)
        );
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("no genre exists", () => {
      it("should create genre", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been created
        expect(
          await Genre.findOne({
            tmdbGenreId: EVENT_DATA.tmdbGenreId,
            language: EVENT_DATA.language,
          })
        ).toEqual(expect.objectContaining(GENRE_A_NEW));
      });
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
