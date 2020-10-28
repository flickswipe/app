import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemDestroyedListener } from "../media-item-destroyed";
import { MediaItem } from "../../../models/media-item";

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

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
        },
        msg
      );

      // has been deleted
      expect(
        await MediaItem.findOne({
          _id: "ab1234567890ab1234567890",
        })
      ).toBeNull();
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

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

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
