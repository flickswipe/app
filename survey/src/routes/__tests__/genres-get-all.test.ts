import request from 'supertest';

import { app } from '../../app';
import { Genre } from '../../modules/track-ingest/models/genre';
// sample data
import { GENRE_A } from '../../test/sample-data/genres';

describe("get genres", () => {
  describe("invalid conditions", () => {
    describe("not signed in", () => {
      // has correct status
      it("returns a 401", async () => {
        await request(app).get("/api/en/survey/genres").send().expect(401);
      });
    });

    describe("no genres exist", () => {
      it("returns a 404", async () => {
        // has correct status
        await request(app)
          .get("/api/en/survey/genres")
          .set("Cookie", await global.signIn())
          .send()
          .expect(404);
      });
    });
  });

  describe("valid conditions", () => {
    beforeEach(async () => {
      await Genre.build(GENRE_A).save();
    });

    it("returns a 200", async () => {
      // has correct status
      await request(app)
        .get("/api/en/survey/genres")
        .set("Cookie", await global.signIn())
        .send()
        .expect(200);
    });

    it("returns an array with at least one genre", async () => {
      const response = await request(app)
        .get("/api/en/survey/genres")
        .set("Cookie", await global.signIn())
        .send();
      // has correct data
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          tmdbGenreId: GENRE_A.tmdbGenreId,
          name: GENRE_A.name,
        })
      );
    });
  });
});
