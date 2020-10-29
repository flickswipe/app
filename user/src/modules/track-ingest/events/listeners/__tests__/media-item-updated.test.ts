import { iso6391 } from "@flickswipe/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { Language } from "../../../models/language";
import { StreamLocation } from "../../../models/stream-location";
import {
  createLanguageIfNotExists,
  MediaItemUpdatedListener,
  parseStreamLocations,
  saveStreamLocation,
} from "../media-item-updated";

const setup = async () => {
  return {
    sampleEventData: {
      id: "ab1234567890ab1234567890",
      tmdbMovieId: 1,
      imdbId: "tt1234567",
      title: "My Movie",
      genres: [Types.ObjectId().toHexString()],
      images: {
        poster: "https://example.com/",
        backdrop: "https://example.com/",
      },
      rating: {
        average: 100,
        count: 101,
        popularity: 102,
      },
      language: "en" as iso6391,
      releaseDate: new Date(),
      runtime: 103,
      plot: "My movie plot...",
      streamLocations: {
        us: [
          {
            id: Types.ObjectId().toHexString(),
            name: "Netflix",
            url: "https://netflix.com/w/12345",
          },
        ],
      },
      updatedAt: new Date(),
    },

    listener: new MediaItemUpdatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("media item updated listener", () => {
  describe("create language if not exists", () => {
    describe("language doesn't exist", () => {
      it("should add language ", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, { language: "en" });

        await createLanguageIfNotExists(data);

        expect(await Language.findOne({ language: "en" })).toEqual(
          expect.objectContaining({
            language: "en",
          })
        );
      });
      it("should return true", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, { language: "en" });

        const result = await createLanguageIfNotExists(data);

        expect(result).toBe(true);
      });
    });
    describe("language exists", () => {
      it("should not add language", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, { language: "en" });

        await Language.build({ language: "en" }).save();

        await createLanguageIfNotExists(data);

        expect(await Language.countDocuments({ language: "en" })).toBe(1);
      });
      it("should return true", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, { language: "en" });

        await Language.build({ language: "en" }).save();

        const result = await createLanguageIfNotExists(data);

        expect(result).toBe(true);
      });
    });
  });

  describe("parse stream locations", () => {
    it("should parse data correctly", async () => {
      const { sampleEventData } = await setup();
      const data = Object.assign(sampleEventData, {
        streamLocations: {
          us: [
            {
              id: Types.ObjectId().toHexString(),
              name: "Netflix",
              url: "https://netflix.com/w/12345",
            },
          ],
        },
      });

      expect(parseStreamLocations(data)[0]).toEqual(
        expect.objectContaining({
          name: "Netflix",
          url: "https://netflix.com",
          country: "us",
        })
      );
    });
    it("should return empty array if data is malformed", async () => {
      const { sampleEventData } = await setup();
      const data = Object.assign(sampleEventData, {
        streamLocations: {
          us: [
            {
              id: Types.ObjectId().toHexString(),
              name: "Netflix",
              url: "invalid-url",
            },
          ],
        },
      });

      console.log("malformed data", data.streamLocations);

      expect(parseStreamLocations(data)).toEqual([]);
    });
  });

  describe("save stream location", () => {
    describe("create new doc", () => {
      it("should create a new doc", async () => {
        const { sampleEventData } = await setup();

        await saveStreamLocation(
          {
            id: Types.ObjectId().toHexString(),
            name: "Netflix",
            url: "https://netflix.com",
            country: "us",
          },
          sampleEventData
        );

        expect(await StreamLocation.findOne()).toEqual(
          expect.objectContaining({
            name: "Netflix",
            url: "https://netflix.com",
            country: "us",
          })
        );
      });
      it("should return true", async () => {
        const { sampleEventData } = await setup();

        const result = await saveStreamLocation(
          {
            id: Types.ObjectId().toHexString(),
            name: "Netflix",
            url: "https://netflix.com",
            country: "us",
          },
          sampleEventData
        );

        expect(result).toBe(true);
      });
    });

    describe("ignore old data", () => {
      it("shouldn't overwrite existing doc", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, {
          updatedAt: new Date(new Date().getTime() - 86600),
        });

        const existingDoc = await StreamLocation.build({
          id: Types.ObjectId().toHexString(),
          name: "Netflix",
          url: "https://netflix.com",
          country: "us",
        }).save();

        await saveStreamLocation(
          {
            id: existingDoc.id,
            name: "New Netflix",
            url: "https://netflix.com",
            country: "us",
          },
          data
        );

        expect(await StreamLocation.findOne()).toEqual(
          expect.objectContaining({
            name: "Netflix",
            url: "https://netflix.com",
            country: "us",
          })
        );
      });
      it("should return true", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, {
          updatedAt: new Date(new Date().getTime() - 86600),
        });

        const existingDoc = await StreamLocation.build({
          id: Types.ObjectId().toHexString(),
          name: "Netflix",
          url: "https://netflix.com",
          country: "us",
        }).save();

        const result = await saveStreamLocation(
          {
            id: existingDoc.id,
            name: "New Netflix",
            url: "https://netflix.com",
            country: "us",
          },
          data
        );

        expect(result).toBe(true);
      });
    });

    describe("update existing doc", () => {
      it("should overwrite existing doc", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, {
          updatedAt: new Date(new Date().getTime() + 86600),
        });

        const existingDoc = await StreamLocation.build({
          id: Types.ObjectId().toHexString(),
          name: "Netflix",
          url: "https://netflix.com",
          country: "us",
        }).save();

        await saveStreamLocation(
          {
            id: existingDoc.id,
            name: "New Netflix",
            url: "https://netflix.com",
            country: "us",
          },
          data
        );

        expect(await StreamLocation.findOne()).toEqual(
          expect.objectContaining({
            name: "New Netflix",
            url: "https://netflix.com",
            country: "us",
          })
        );
      });
      it("should return true", async () => {
        const { sampleEventData } = await setup();

        const data = Object.assign(sampleEventData, {
          updatedAt: new Date(new Date().getTime() + 86600),
        });

        const existingDoc = await StreamLocation.build({
          id: Types.ObjectId().toHexString(),
          name: "Netflix",
          url: "https://netflix.com",
          country: "us",
        }).save();

        const result = await saveStreamLocation(
          {
            id: existingDoc.id,
            name: "New Netflix",
            url: "https://netflix.com",
            country: "us",
          },
          data
        );

        expect(result).toBe(true);
      });
    });
  });

  describe("on message", () => {
    describe("with valid data", () => {
      it("should update language collection", async () => {
        const { sampleEventData, listener, msg } = await setup();

        await listener.onMessage(sampleEventData, msg);

        expect(await Language.countDocuments()).toBe(1);
      });
      it("should update stream location collection", async () => {
        const { sampleEventData, listener, msg } = await setup();

        await listener.onMessage(sampleEventData, msg);

        expect(await StreamLocation.countDocuments()).toBe(1);
      });
      it("should acknowledge the message", async () => {
        const { sampleEventData, listener, msg } = await setup();

        await listener.onMessage(sampleEventData, msg);

        expect(msg.ack).toHaveBeenCalled();
      });
    });
    describe("with invalid url data", () => {
      it("should update language collection", async () => {
        const { sampleEventData, listener, msg } = await setup();
        const data = Object.assign(sampleEventData, {
          streamLocations: {
            us: [
              {
                id: Types.ObjectId().toHexString(),
                name: "Netflix",
                url: "invalid-url",
              },
            ],
          },
        });

        await listener.onMessage(data, msg);

        expect(await Language.countDocuments()).toBe(1);
      });
      it("should not update stream location collection", async () => {
        const { sampleEventData, listener, msg } = await setup();
        const data = Object.assign(sampleEventData, {
          streamLocations: {
            us: [
              {
                id: Types.ObjectId().toHexString(),
                name: "Netflix",
                url: "invalid-url",
              },
            ],
          },
        });
        await listener.onMessage(data, msg);

        expect(await StreamLocation.countDocuments()).toBe(0);
      });
      it("should acknowledge the message", async () => {
        const { sampleEventData, listener, msg } = await setup();
        const data = Object.assign(sampleEventData, {
          streamLocations: {
            us: [
              {
                id: Types.ObjectId().toHexString(),
                name: "Netflix",
                url: "invalid-url",
              },
            ],
          },
        });

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
      });
    });
  });
});
