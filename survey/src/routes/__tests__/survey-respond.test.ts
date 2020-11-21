import { InterestType } from "@flickswipe/common";
import request from "supertest";
import { app } from "../../app";
import { Genre } from "../../modules/track-ingest/models/genre";
import { MediaItem } from "../../modules/track-ingest/models/media-item";

describe("survey respond", () => {
  beforeEach(async () => {
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
  });

  it("returns a 401", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .send({
        interestType: InterestType.Interested,
      })
      .expect(401);
  });

  it("returns a 404", async () => {
    await request(app)
      .post("/api/en/survey/aaabbbcccddd/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Interested,
      })
      .expect(404);
  });

  it("returns a 400 when invalid id", async () => {
    await request(app)
      .post("/api/en/survey/invalidid/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Interested,
      })
      .expect(400);
  });

  it("returns a 400 when no interest type", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({})
      .expect(400);
  });

  it("returns a 400 with invalid interest type", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: "invalid",
      })
      .expect(400);
  });

  it("returns a 400 when rating greater than 100", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Consumed,
        rating: 500,
      })
      .expect(400);
  });

  it("returns a 400 when rating less than 0", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Consumed,
        rating: -1,
      })
      .expect(400);
  });

  it("returns a 400 when rating not a number", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Consumed,
        rating: "10",
      })
      .expect(400);
  });

  it("returns a 400 when rating given for unconsumed media", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Interested,
        rating: 5,
      })
      .expect(400);
  });

  it("returns a 200 with no rating", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Consumed,
      })
      .expect(200);
  });

  it("returns a 200 with rating", async () => {
    await request(app)
      .post("/api/en/survey/bc1234567890ab1234567890/respond")
      .set("Cookie", await global.signIn())
      .send({
        interestType: InterestType.Consumed,
        rating: 5,
      })
      .expect(200);
  });
});
