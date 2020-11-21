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
      country: "",
    },
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
      .send(sampleSettings)
      .expect(200);
  });

  it("should call updateCountry correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        country: "",
      });

    expect(updateCountry).toHaveBeenCalledWith(expect.any(String), "");
  });

  it("should call updateGenres correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        genres: {},
      });

    expect(updateGenres).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateLanguages correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        languages: {},
      });

    expect(updateLanguages).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateRating correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        rating: {},
      });

    expect(updateRating).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateReleaseDate correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        releaseDate: {},
      });

    expect(updateReleaseDate).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateRuntime correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        runtime: {},
      });

    expect(updateRuntime).toHaveBeenCalledWith(expect.any(String), {});
  });

  it("should call updateStreamLocations correctly", async () => {
    await request(app)
      .post(`/api/en/user/settings/update`)
      .set("Cookie", await global.signIn())
      .send({
        streamLocations: {},
      });

    expect(updateStreamLocations).toHaveBeenCalledWith(expect.any(String), {});
  });
});
