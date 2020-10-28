import request from "supertest";
import { app } from "../../app";
import { Genre } from "../../modules/track-ingest/models/genre";
import { MediaItem } from "../../modules/track-ingest/models/media-item";

describe("get media item", () => {
  it("returns a 401", async () => {
    await request(app)
      .get("/api/en/survey/media-item/bc1234567890ab1234567890")
      .send()
      .expect(401);
  });

  it("returns a 404", async () => {
    await request(app)
      .get("/api/en/survey/media-item/bc1234567890ab1234567890")
      .set("Cookie", await global.signIn())
      .send()
      .expect(404);
  });

  it("returns a 200", async () => {
    await Genre.build({
      id: "ab1234567890ab1234567890",
      name: "My Genre",
      language: "en",
    }).save();

    await MediaItem.build({
      id: "bc1234567890ab1234567890",
      tmdbMovieId: 123,
      imdbId: "tt1234567",
      title: "My Movie",
      images: {
        poster: "https://example.com/",
        backdrop: "https://example.com/",
      },
      genres: ["ab1234567890ab1234567890"],
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

    await request(app)
      .get("/api/en/survey/media-item/bc1234567890ab1234567890")
      .set("Cookie", await global.signIn())
      .send()
      .expect(200);
  });

  it("returns media item", async () => {
    await Genre.build({
      id: "ab1234567890ab1234567890",
      name: "My Genre",
      language: "en",
    }).save();

    await MediaItem.build({
      id: "bc1234567890ab1234567890",
      tmdbMovieId: 123,
      imdbId: "tt1234567",
      title: "My Movie",
      images: {
        poster: "https://example.com/",
        backdrop: "https://example.com/",
      },
      genres: ["ab1234567890ab1234567890"],
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

    const response = await request(app)
      .get("/api/en/survey/media-item/bc1234567890ab1234567890")
      .set("Cookie", await global.signIn())
      .send()
      .expect(200);

    console.info(response.body);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: "bc1234567890ab1234567890",
        tmdbMovieId: 123,
        imdbId: "tt1234567",
        title: "My Movie",
      })
    );
  });
});
