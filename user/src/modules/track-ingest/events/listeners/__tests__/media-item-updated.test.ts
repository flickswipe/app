import mongoose from "mongoose";
import cloneDeep from "clone-deep";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";

import { Country } from "../../../models/country";
import { Language } from "../../../models/language";
import {
  StreamLocation,
  StreamLocationDoc,
} from "../../../models/stream-location";
import {
  createCountryIfNotExists,
  createLanguageIfNotExists,
  MediaItemUpdatedListener,
  parseStreamLocations,
  saveStreamLocation,
} from "../media-item-updated";
import { iso6391 } from "@flickswipe/common";

// sample data
import {
  MEDIA_ITEM_A,
  MEDIA_ITEM_A_NEW,
} from "../../../../../test/sample-data/media-items";
const LANGUAGE = {
  language: MEDIA_ITEM_A_NEW.language as iso6391,
};
const COUNTRY = {
  country: Object.keys(MEDIA_ITEM_A_NEW.streamLocations)[0],
};
const STREAM_LOCATIONS = [
  {
    id: MEDIA_ITEM_A.streamLocations.us[0].id,
    name: MEDIA_ITEM_A.streamLocations.us[0].name,
    url: MEDIA_ITEM_A.streamLocations.us[0].url,
    country: Object.keys(MEDIA_ITEM_A.streamLocations)[0],
  },
];
const STREAM_LOCATIONS_NEW = [
  {
    id: MEDIA_ITEM_A_NEW.streamLocations.us[0].id,
    name: MEDIA_ITEM_A_NEW.streamLocations.us[0].name,
    url: MEDIA_ITEM_A_NEW.streamLocations.us[0].url,
    country: Object.keys(MEDIA_ITEM_A_NEW.streamLocations)[0],
  },
];
const EVENT_DATA = {
  id: MEDIA_ITEM_A_NEW.id,
  tmdbMovieId: MEDIA_ITEM_A_NEW.tmdbMovieId,
  imdbId: MEDIA_ITEM_A_NEW.imdbId,
  title: MEDIA_ITEM_A_NEW.title,
  genres: cloneDeep(MEDIA_ITEM_A_NEW.genres),
  images: cloneDeep(MEDIA_ITEM_A_NEW.images),
  rating: cloneDeep(MEDIA_ITEM_A_NEW.rating),
  language: MEDIA_ITEM_A_NEW.language as iso6391,
  releaseDate: MEDIA_ITEM_A_NEW.releaseDate,
  runtime: MEDIA_ITEM_A_NEW.runtime,
  plot: MEDIA_ITEM_A_NEW.plot,
  streamLocations: cloneDeep(MEDIA_ITEM_A_NEW.streamLocations),
  updatedAt: new Date(),
};
const EVENT_DATA_STALE = Object.assign(cloneDeep(EVENT_DATA), {
  updatedAt: new Date(new Date().getTime() - 86600),
});
const EVENT_DATA_INVALID_STREAM_LOCATIONS = Object.assign(
  cloneDeep(EVENT_DATA),
  {
    streamLocations: {
      us: [
        {
          id: mongoose.Types.ObjectId().toHexString(),
          name: "Netflix",
          url: "invalid-url",
        },
      ],
    },
  }
);

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
  /**
   * createLanguageIfNotExists()
   */
  describe("create language if not exists", () => {
    describe("no language exists", () => {
      it("should create language ", async () => {
        await createLanguageIfNotExists(LANGUAGE.language);

        // has been created
        expect(await Language.countDocuments(LANGUAGE)).toBe(1);
      });
    });

    describe("language exists", () => {
      beforeEach(async () => {
        await Language.build(LANGUAGE).save();
      });

      it("should not create language", async () => {
        await createLanguageIfNotExists(LANGUAGE.language);

        // has not been created
        expect(await Language.countDocuments(LANGUAGE)).toBe(1);
      });
    });
  });

  /**
   * parseStreamLocations()
   */
  describe("parse stream locations", () => {
    describe("invalid conditions", () => {
      it("should return empty array", async () => {
        // has correct data
        expect(
          parseStreamLocations(EVENT_DATA_INVALID_STREAM_LOCATIONS)
        ).toEqual([]);
      });
    });

    describe("valid conditions", () => {
      it("should return array of stream locations", async () => {
        const parsed = parseStreamLocations(EVENT_DATA);

        // has correct data
        expect(parsed).toBeInstanceOf(Array);
        expect(parsed).toHaveLength(STREAM_LOCATIONS.length);
        expect(parsed[0]).toEqual(
          expect.objectContaining({
            name: STREAM_LOCATIONS[0].name,
            url: STREAM_LOCATIONS[0].url,
            country: STREAM_LOCATIONS[0].country,
          })
        );
      });
    });
  });

  /**
   * saveStreamLocation()
   */
  describe("save stream location", () => {
    describe("no doc exists", () => {
      it("should create doc", async () => {
        await saveStreamLocation(STREAM_LOCATIONS_NEW[0], EVENT_DATA);

        // has been created
        expect(
          await StreamLocation.findById(STREAM_LOCATIONS_NEW[0].id)
        ).toEqual(expect.objectContaining(STREAM_LOCATIONS_NEW[0]));
      });
    });

    describe("doc exists", () => {
      let existingDoc: StreamLocationDoc;
      beforeEach(async () => {
        existingDoc = await StreamLocation.build(STREAM_LOCATIONS[0]).save();
      });

      describe("data received out of order", () => {
        it("should not overwrite doc", async () => {
          await saveStreamLocation(STREAM_LOCATIONS_NEW[0], EVENT_DATA_STALE);

          // has not been overwritten
          expect(await StreamLocation.findById(existingDoc.id)).toEqual(
            expect.objectContaining({
              name: STREAM_LOCATIONS[0].name,
              url: STREAM_LOCATIONS[0].url,
              country: STREAM_LOCATIONS[0].country,
            })
          );
        });
      });
    });
  });

  /**
   * createCountryIfNotExists()
   */
  describe("create country if not exists", () => {
    describe("no country exists", () => {
      it("should create country ", async () => {
        await createCountryIfNotExists(COUNTRY.country);

        // has been created
        expect(await Country.countDocuments(COUNTRY)).toBe(1);
      });
    });
    describe("country exists", () => {
      beforeEach(async () => {
        await Country.build(COUNTRY).save();
      });
      it("should not create country", async () => {
        await createCountryIfNotExists("us");

        // has not been created
        expect(await Country.countDocuments(COUNTRY)).toBe(1);
      });
    });
  });

  /**
   * onMessage()
   */
  describe("on message", () => {
    describe("invalid url", () => {
      it("should create language", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_INVALID_STREAM_LOCATIONS, msg);

        // has been created
        expect(await Language.countDocuments()).toBe(1);
      });
      it("should not create stream location", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_INVALID_STREAM_LOCATIONS, msg);

        // has been created
        expect(await StreamLocation.countDocuments()).toBe(0);
      });
      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA_INVALID_STREAM_LOCATIONS, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });
  });

  describe("valid conditions", () => {
    it("should create language", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
      expect(await Language.countDocuments()).toBe(1);
    });
    it("should create stream location", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
      expect(await StreamLocation.countDocuments()).toBe(1);
    });
    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
