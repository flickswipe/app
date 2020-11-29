import { Message } from "node-nats-streaming";
import { Genre } from "../../../models/genre";
import { natsWrapper } from "../../../../../nats-wrapper";
import { GenreDetectedListener } from "../genre-detected";

// sample data
import { GENRE_A } from "../../../../../test/sample-data/genres";

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
    describe("data received out of order", () => {
      it("should not overwrite", async () => {
        const existingDoc = await Genre.build(GENRE_A).save();

        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            tmdbGenreId: GENRE_A.tmdbGenreId,
            name: "New Name",
            language: GENRE_A.language,
            detectedAt: new Date(new Date().getTime() - 86600),
          },
          msg
        );

        // has not been overwritten
        expect(await Genre.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            name: GENRE_A.name,
            updatedAt: existingDoc.updatedAt,
          })
        );

        // no extra record inserted
        expect(await Genre.countDocuments()).toBe(1);
      });

      it("should acknowledge the message", async () => {
        await Genre.build(GENRE_A).save();

        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            tmdbGenreId: GENRE_A.tmdbGenreId,
            name: "New Name",
            language: GENRE_A.language,
            detectedAt: new Date(new Date().getTime() - 86600),
          },
          msg
        );

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("data received in order", () => {
      it("should overwrite genre", async () => {
        const existingDoc = await Genre.build(GENRE_A).save();

        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            tmdbGenreId: GENRE_A.tmdbGenreId,
            name: "New Name",
            language: GENRE_A.language,
            detectedAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );

        // has been overwritten
        expect(await Genre.findById(existingDoc.id)).toEqual(
          expect.objectContaining({
            name: "New Name",
          })
        );

        // no extra record inserted
        expect(await Genre.countDocuments()).toBe(1);
      });

      it("should acknowledge the message", async () => {
        await Genre.build(GENRE_A).save();

        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            tmdbGenreId: GENRE_A.tmdbGenreId,
            name: "New Name",
            language: GENRE_A.language,
            detectedAt: new Date(new Date().getTime() + 86600),
          },
          msg
        );

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("no genre exists", () => {
      it("should create genre", async () => {
        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            tmdbGenreId: GENRE_A.tmdbGenreId,
            name: GENRE_A.name,
            language: GENRE_A.language,
            detectedAt: new Date(),
          },
          msg
        );

        // has been created
        expect(
          await Genre.findOne({
            tmdbGenreId: GENRE_A.tmdbGenreId,
            language: GENRE_A.language,
          })
        ).toEqual(
          expect.objectContaining({
            name: GENRE_A.name,
          })
        );
      });
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          tmdbGenreId: GENRE_A.tmdbGenreId,
          name: GENRE_A.name,
          language: GENRE_A.language,
          detectedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
