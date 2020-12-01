import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { getSettings } from "../../modules/settings/settings";
import {
  getGenres,
  getAudioLanguages,
  getStreamLocations,
} from "../../modules/track-ingest/track-ingest";
import { GENRE_A, GENRE_B, GENRE_C } from "../../test/sample-data/genres";
import {
  ALL_SETTINGS_EMPTY,
  GENRES_SETTING,
  AUDIO_LANGUAGES_SETTING,
  STREAM_LOCATIONS_SETTING,
} from "../../test/sample-data/settings";
import { USER_A } from "../../test/sample-data/users";

jest.mock("../../modules/settings/settings");
jest.mock("../../modules/track-ingest/track-ingest");

describe("get settings", () => {
  describe("invalid conditions", () => {
    describe("not signed in", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app).get("/api/en/user/settings").send().expect(401);
      });
    });
  });

  describe("valid conditions", () => {
    it("returns a 200", async () => {
      // has correct status
      await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn(USER_A.id))
        .send()
        .expect(200);
    });

    it("calls getSettings", async () => {
      await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has been called
      expect(getSettings).toHaveBeenCalled();
    });

    it("returns value of getSettings", async () => {
      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has correct data
      expect(response.body).toEqual(await getSettings(USER_A.id));
    });

    it("aggregates value of getSettings with getGenres", async () => {
      // @ts-ignore
      getSettings.mockResolvedValue(
        Object.assign({}, ALL_SETTINGS_EMPTY, {
          genres: GENRES_SETTING.value,
        })
      );

      // @ts-ignore
      getGenres.mockResolvedValueOnce([GENRE_A, GENRE_B, GENRE_C]);

      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has correct data
      expect(response.body).toEqual(
        expect.objectContaining({
          genres: {
            [GENRE_A.tmdbGenreId]: true,
            [GENRE_B.tmdbGenreId]: false,
            [GENRE_C.tmdbGenreId]: false,
          },
        })
      );
    });

    it("aggregates value of getSettings with getAudioLanguages", async () => {
      // @ts-ignore
      getSettings.mockResolvedValue(
        Object.assign({}, ALL_SETTINGS_EMPTY, {
          audioLanguages: AUDIO_LANGUAGES_SETTING.value,
        })
      );

      // @ts-ignore
      getAudioLanguages.mockResolvedValueOnce([
        { audioLanguage: "en" },
        { audioLanguage: "es" },
        { audioLanguage: "de" },
      ]);

      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has correct data
      expect(response.body).toEqual(
        expect.objectContaining({
          audioLanguages: {
            en: true, // @todo make this dynamic
            es: false,
            de: false,
          },
        })
      );
    });

    it("aggregates value of getSettings with getStreamLocations", async () => {
      // @ts-ignore
      getSettings.mockResolvedValue(
        Object.assign({}, ALL_SETTINGS_EMPTY, {
          streamLocations: STREAM_LOCATIONS_SETTING.value,
        })
      );

      // @ts-ignore
      getStreamLocations.mockResolvedValueOnce([
        { id: mongoose.Types.ObjectId("netflixnetfl").toHexString() },
        { id: mongoose.Types.ObjectId("amazonamazon").toHexString() },
        { id: mongoose.Types.ObjectId("disneydisney").toHexString() },
      ]);

      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has correct data
      expect(response.body).toEqual(
        expect.objectContaining({
          streamLocations: {
            [mongoose.Types.ObjectId("netflixnetfl").toHexString()]: true, // @todo make dynamic
            [mongoose.Types.ObjectId("amazonamazon").toHexString()]: false,
            [mongoose.Types.ObjectId("disneydisney").toHexString()]: true,
          },
        })
      );
    });
  });
});
