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
  describe("ignore old data", () => {
    it("should not overwrite a more recent doc", async () => {
      const existingDoc = await Genre.build(GENRE_A).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          genreId: GENRE_A.genreId,
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
          genreId: GENRE_A.genreId,
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

  describe("update existing doc", () => {
    it("should overwrite existing doc", async () => {
      const existingDoc = await Genre.build(GENRE_A).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          genreId: GENRE_A.genreId,
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
          genreId: GENRE_A.genreId,
          name: "New Name",
          language: GENRE_A.language,
          detectedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });

    describe("create new doc", () => {
      it("should create a new doc", async () => {
        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            genreId: GENRE_A.genreId,
            name: GENRE_A.name,
            language: GENRE_A.language,
            detectedAt: new Date(),
          },
          msg
        );

        // has not been overwritten
        expect(
          await Genre.findOne({
            genreId: GENRE_A.genreId,
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
          genreId: GENRE_A.genreId,
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
