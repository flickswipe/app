import { Message } from "node-nats-streaming";
import { MediaItem } from "../../../models/media-item";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemUpdatedListener } from "../media-item-updated";

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
  describe("ignore old data", () => {
    it("should not overwrite a more recent doc", async () => {
      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        tmdbMovieId: 123,
        imdbId: "tt1234567",
        title: "My Movie",
        images: {
          poster: "https://example.com/",
          backdrop: "https://example.com/",
        },
        genres: ["bc1234567890ab1234567890"],
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        language: "en",
        releaseDate: new Date(),
        runtime: 103,
        plot: "My movie plit...",
        streamLocations: {
          us: [
            {
              id: "0987654321234567890",
              name: "Netflix",
              url: "https://example.com/",
            },
          ],
        },
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          tmdbMovieId: 123,
          imdbId: "tt1234567",
          title: "My New Movie",
          images: {
            poster: "https://example.com/",
            backdrop: "https://example.com/",
          },
          genres: ["bc1234567890ab1234567890"],
          rating: {
            average: 100,
            count: 101,
            popularity: 102,
          },
          language: "en",
          releaseDate: new Date(),
          runtime: 103,
          plot: "My movie plit...",
          streamLocations: {
            us: [
              {
                id: "0987654321234567890",
                name: "Netflix",
                url: "https://example.com/",
              },
            ],
          },
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      // has not been overwritten
      expect(
        await MediaItem.findOne({
          _id: "ab1234567890ab1234567890",
        })
      ).toEqual(
        expect.objectContaining({
          title: "My Movie",
        })
      );
    });

    it("should acknowledge the message", async () => {
      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        tmdbMovieId: 123,
        imdbId: "tt1234567",
        title: "My Movie",
        images: {
          poster: "https://example.com/",
          backdrop: "https://example.com/",
        },
        genres: ["bc1234567890ab1234567890"],
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        language: "en",
        releaseDate: new Date(),
        runtime: 103,
        plot: "My movie plit...",
        streamLocations: {
          us: [
            {
              id: "0987654321234567890",
              name: "Netflix",
              url: "https://example.com/",
            },
          ],
        },
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          tmdbMovieId: 123,
          imdbId: "tt1234567",
          title: "My New Movie",
          images: {
            poster: "https://example.com/",
            backdrop: "https://example.com/",
          },
          genres: ["bc1234567890ab1234567890"],
          rating: {
            average: 100,
            count: 101,
            popularity: 102,
          },
          language: "en",
          releaseDate: new Date(),
          runtime: 103,
          plot: "My movie plit...",
          streamLocations: {
            us: [
              {
                id: "0987654321234567890",
                name: "Netflix",
                url: "https://example.com/",
              },
            ],
          },
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("update existing doc", () => {
    it("should overwrite existing doc", async () => {
      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        tmdbMovieId: 123,
        imdbId: "tt1234567",
        title: "My Movie",
        images: {
          poster: "https://example.com/",
          backdrop: "https://example.com/",
        },
        genres: ["bc1234567890ab1234567890"],
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        language: "en",
        releaseDate: new Date(),
        runtime: 103,
        plot: "My movie plit...",
        streamLocations: {
          us: [
            {
              id: "0987654321234567890",
              name: "Netflix",
              url: "https://example.com/",
            },
          ],
        },
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          tmdbMovieId: 123,
          imdbId: "tt1234567",
          title: "My New Movie",
          images: {
            poster: "https://example.com/",
            backdrop: "https://example.com/",
          },
          genres: ["bc1234567890ab1234567890"],
          rating: {
            average: 100,
            count: 101,
            popularity: 102,
          },
          language: "en",
          releaseDate: new Date(),
          runtime: 103,
          plot: "My movie plit...",
          streamLocations: {
            us: [
              {
                id: "0987654321234567890",
                name: "Netflix",
                url: "https://example.com/",
              },
            ],
          },
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been overwritten
      expect(
        await MediaItem.findOne({
          _id: "ab1234567890ab1234567890",
        })
      ).toEqual(
        expect.objectContaining({
          title: "My New Movie",
        })
      );
    });

    it("should acknowledge the message", async () => {
      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        tmdbMovieId: 123,
        imdbId: "tt1234567",
        title: "My Movie",
        images: {
          poster: "https://example.com/",
          backdrop: "https://example.com/",
        },
        genres: ["bc1234567890ab1234567890"],
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        language: "en",
        releaseDate: new Date(),
        runtime: 103,
        plot: "My movie plit...",
        streamLocations: {
          us: [
            {
              id: "0987654321234567890",
              name: "Netflix",
              url: "https://example.com/",
            },
          ],
        },
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          tmdbMovieId: 123,
          imdbId: "tt1234567",
          title: "My New Movie",
          images: {
            poster: "https://example.com/",
            backdrop: "https://example.com/",
          },
          genres: ["bc1234567890ab1234567890"],
          rating: {
            average: 100,
            count: 101,
            popularity: 102,
          },
          language: "en",
          releaseDate: new Date(),
          runtime: 103,
          plot: "My movie plit...",
          streamLocations: {
            us: [
              {
                id: "0987654321234567890",
                name: "Netflix",
                url: "https://example.com/",
              },
            ],
          },
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("create new doc", () => {
    it("should create a new doc", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          tmdbMovieId: 123,
          imdbId: "tt1234567",
          title: "My Movie",
          images: {
            poster: "https://example.com/",
            backdrop: "https://example.com/",
          },
          genres: ["bc1234567890ab1234567890"],
          rating: {
            average: 100,
            count: 101,
            popularity: 102,
          },
          language: "en",
          releaseDate: new Date(),
          runtime: 103,
          plot: "My movie plit...",
          streamLocations: {
            us: [
              {
                id: "0987654321234567890",
                name: "Netflix",
                url: "https://example.com/",
              },
            ],
          },
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been created
      expect(
        await MediaItem.findOne({
          _id: "ab1234567890ab1234567890",
        })
      ).toEqual(
        expect.objectContaining({
          title: "My Movie",
        })
      );
    });
    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          tmdbMovieId: 123,
          imdbId: "tt1234567",
          title: "My Movie",
          images: {
            poster: "https://example.com/",
            backdrop: "https://example.com/",
          },
          genres: ["bc1234567890ab1234567890"],
          rating: {
            average: 100,
            count: 101,
            popularity: 102,
          },
          language: "en",
          releaseDate: new Date(),
          runtime: 103,
          plot: "My movie plit...",
          streamLocations: {
            us: [
              {
                id: "0987654321234567890",
                name: "Netflix",
                url: "https://example.com/",
              },
            ],
          },
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
