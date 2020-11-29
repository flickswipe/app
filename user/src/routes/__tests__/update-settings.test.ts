import request from "supertest";
import { app } from "../../app";
import {
  updateCountry,
  updateGenres,
  updateLanguages,
  updateRating,
  updateReleaseDate,
  updateRuntime,
  updateStreamLocations,
} from "../../modules/settings/settings";
import { ALL_SETTINGS_EMPTY } from "../../test/sample-data/settings";
import { USER_A } from "../../test/sample-data/users";

jest.mock("../../modules/settings/settings");

describe("update settings", () => {
  describe("invalid conditions", () => {
    describe("invalid body", () => {
      it("should return a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/user/settings/update`)
          .set("Cookie", await global.signIn(USER_A.id))
          .send()
          .expect(400);
      });
    });

    describe("not signed in", () => {
      it("should return a 401", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/user/settings/update`)
          .send({
            settings: {},
          })
          .expect(401);
      });
    });
  });

  describe("valid conditions", () => {
    it.each(
      Object.keys(ALL_SETTINGS_EMPTY).map((key) => {
        return {
          [key]: ALL_SETTINGS_EMPTY[key],
        };
      })
    )("should return a 200", async (sampleSettings) => {
      // has correct status
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send(sampleSettings)
        .expect(200);
    });

    it("should call updateCountry correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          country: ALL_SETTINGS_EMPTY.country,
        });

      // has correct data
      expect(updateCountry).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.country
      );
    });

    it("should call updateGenres correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          genres: ALL_SETTINGS_EMPTY.genres,
        });

      // has correct data
      expect(updateGenres).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.genres
      );
    });

    it("should call updateLanguages correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          languages: ALL_SETTINGS_EMPTY.languages,
        });

      // has correct data
      expect(updateLanguages).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.languages
      );
    });

    it("should call updateRating correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          rating: ALL_SETTINGS_EMPTY.rating,
        });

      // has correct data
      expect(updateRating).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.rating
      );
    });

    it("should call updateReleaseDate correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          releaseDate: ALL_SETTINGS_EMPTY.releaseDate,
        });

      // has correct data
      expect(updateReleaseDate).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.releaseDate
      );
    });

    it("should call updateRuntime correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          runtime: ALL_SETTINGS_EMPTY.runtime,
        });

      // has correct data
      expect(updateRuntime).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.runtime
      );
    });

    it("should call updateStreamLocations correctly", async () => {
      await request(app)
        .post(`/api/en/user/settings/update`)
        .set("Cookie", await global.signIn(USER_A.id))
        .send({
          streamLocations: ALL_SETTINGS_EMPTY.streamLocations,
        });

      // has correct data
      expect(updateStreamLocations).toHaveBeenCalledWith(
        expect.any(String),
        ALL_SETTINGS_EMPTY.streamLocations
      );
    });
  });
});
