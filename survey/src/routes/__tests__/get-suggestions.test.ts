import { InterestType } from "@flickswipe/common";
import request from "supertest";
import { app } from "../../app";
import { SurveyResponse } from "../../modules/handle-survey-response/models/survey-response";
import { Genre } from "../../modules/track-ingest/models/genre";
import { MediaItem } from "../../modules/track-ingest/models/media-item";
import { Suggestion } from "../../modules/track-predict/models/suggestion";

describe("get suggestions", () => {
  it("returns a 401", async () => {
    await request(app).get("/api/en/survey/queue").send().expect(401);
  });

  it("returns a 404", async () => {
    await request(app)
      .get("/api/en/survey/queue")
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

    await Suggestion.build({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
    }).save();

    await request(app)
      .get("/api/en/survey/queue")
      .set("Cookie", await global.signIn("aaabbbcccddd"))
      .send()
      .expect(200);
  });

  it("returns an array with at least one media item", async () => {
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

    await Suggestion.build({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
    }).save();

    const response = await request(app)
      .get("/api/en/survey/queue")
      .set("Cookie", await global.signIn("aaabbbcccddd"))
      .send();

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: "bc1234567890ab1234567890",
        title: "My Movie",
      })
    );
  });

  it("doesn't include suggestions that have responses", async () => {
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

    await Suggestion.build({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
    }).save();

    await SurveyResponse.build({
      user: "aaabbbcccddd",
      mediaItem: "bc1234567890ab1234567890",
      interestType: InterestType.Consumed,
    }).save();

    const response = await request(app)
      .get("/api/en/survey/queue")
      .set("Cookie", await global.signIn("aaabbbcccddd"))
      .send();

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(0);
  });
});
