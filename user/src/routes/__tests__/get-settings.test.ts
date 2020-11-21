import request from "supertest";
import { app } from "../../app";
import { listAllSettings } from "../../modules/settings/settings";
import {
  getGenres,
  getLanguages,
  getStreamLocations,
} from "../../modules/track-ingest/track-ingest";

jest.mock("../../modules/settings/settings");
jest.mock("../../modules/track-ingest/track-ingest");

describe("get settings", () => {
  describe("user not signed in", () => {
    it("returns a 400", async () => {
      await request(app).get("/api/en/user/settings").send().expect(401);
    });
  });

  describe("user signed in", () => {
    it("returns a 200", async () => {
      await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send()
        .expect(200);
    });

    it("calls listAllSettings", async () => {
      await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(listAllSettings).toHaveBeenCalled();
    });

    it("returns value of listAllSettings", async () => {
      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(response.body).toEqual(await listAllSettings("sourcesource"));
    });

    it("aggregates value of listAllSettings with getGenres", async () => {
      // @ts-ignore
      listAllSettings.mockResolvedValue({
        genres: { customcustom: true },
        languages: {},
        rating: {},
        releaseDate: {},
        runtime: {},
        streamLocations: {},
      });

      // @ts-ignore
      getGenres.mockResolvedValueOnce([
        { id: "scifiscifisc" },
        { id: "horrorhorror" },
      ]);

      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(response.body).toEqual(
        expect.objectContaining({
          genres: {
            customcustom: true,
            scifiscifisc: false,
            horrorhorror: false,
          },
        })
      );
    });
    it("aggregates value of listAllSettings with getLanguages", async () => {
      // @ts-ignore
      listAllSettings.mockResolvedValue({
        genres: {},
        languages: { en: true },
        rating: {},
        releaseDate: {},
        runtime: {},
        streamLocations: {},
      });

      // @ts-ignore
      getLanguages.mockResolvedValueOnce([
        { language: "de" },
        { language: "es" },
      ]);

      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(response.body).toEqual(
        expect.objectContaining({
          languages: {
            en: true,
            de: false,
            es: false,
          },
        })
      );
    });

    it("aggregates value of listAllSettings with getStreamLocations", async () => {
      // @ts-ignore
      listAllSettings.mockResolvedValue({
        genres: {},
        languages: {},
        rating: {},
        releaseDate: {},
        runtime: {},
        streamLocations: { netflixnetfl: true },
      });

      // @ts-ignore
      getStreamLocations.mockResolvedValueOnce([
        { id: "amazonamazon" },
        { id: "disneydisney" },
      ]);

      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(response.body).toEqual(
        expect.objectContaining({
          streamLocations: {
            netflixnetfl: true,
            amazonamazon: true,
            disneydisney: true,
          },
        })
      );
    });
  });
});
