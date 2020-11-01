import request from "supertest";
import { app } from "../../app";
import {
  updateGenres,
  updateLanguages,
  updateRating,
  updateReleaseDate,
  updateRuntime,
  updateStreamLocations,
} from "../../modules/settings/settings";

jest.mock("../../modules/settings/settings");

describe("update settings", () => {
  it("should return a 401 if not signed in", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .send({
        settings: {},
      })
      .expect(401);
  });

  it("should return a 400", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send()
      .expect(400);
  });

  it.each([
    {
      genres: {},
    },
    {
      languages: {},
    },
    {
      rating: {},
    },
    {
      releaseDate: {},
    },
    {
      runtime: {},
    },
    {
      streamLocations: {},
    },
  ])("should return a 200", async (sampleSettings) => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: sampleSettings,
      })
      .expect(200);
  });

  it("should call updateGenres correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: {
          genres: {},
        },
      });

    expect(updateGenres).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateLanguages correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: {
          languages: {},
        },
      });

    expect(updateLanguages).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateRating correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: {
          rating: {},
        },
      });

    expect(updateRating).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateReleaseDate correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: {
          releaseDate: {},
        },
      });

    expect(updateReleaseDate).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateRuntime correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: {
          runtime: {},
        },
      });

    expect(updateRuntime).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateStreamLocations correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        settings: {
          streamLocations: {},
        },
      });

    expect(updateStreamLocations).toHaveBeenCalledWith(expect.any(String), {});
  });
});
