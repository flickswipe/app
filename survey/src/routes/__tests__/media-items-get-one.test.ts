import request from 'supertest';

import { app } from '../../app';
import { Genre } from '../../modules/track-ingest/models/genre';
import { MediaItem } from '../../modules/track-ingest/models/media-item';
// sample data
import { GENRE_A } from '../../test/sample-data/genres';
import { MEDIA_ITEM_A } from '../../test/sample-data/media-items';

describe("get media item", () => {
  describe("invalid conditions", () => {
    describe("not signed in", () => {
      it("returns a 401", async () => {
        // has correct status
        await request(app)
          .get(`/api/en/survey/media-item/${MEDIA_ITEM_A.id}`)
          .send()
          .expect(401);
      });
    });

    describe("no media items exist", () => {
      it("returns a 404", async () => {
        // has correct status
        await request(app)
          .get(`/api/en/survey/media-item/${MEDIA_ITEM_A.id}`)
          .set("Cookie", await global.signIn())
          .send()
          .expect(404);
      });
    });
  });

  describe("valid conditions", () => {
    beforeEach(async () => {
      await Promise.all([
        Genre.build(GENRE_A).save(),
        MediaItem.build(MEDIA_ITEM_A).save(),
      ]);
    });

    it("returns a 200", async () => {
      // has correct status
      await request(app)
        .get(`/api/en/survey/media-item/${MEDIA_ITEM_A.id}`)
        .set("Cookie", await global.signIn())
        .send()
        .expect(200);
    });

    it("returns media item", async () => {
      const response = await request(app)
        .get(`/api/en/survey/media-item/${MEDIA_ITEM_A.id}`)
        .set("Cookie", await global.signIn())
        .send();

      // has correct data
      expect(response.body).toEqual(
        expect.objectContaining({
          id: MEDIA_ITEM_A.id,
          tmdbMovieId: MEDIA_ITEM_A.tmdbMovieId,
          imdbId: MEDIA_ITEM_A.imdbId,
          title: MEDIA_ITEM_A.title,
        })
      );
      expect(response.body.genres[0]).toEqual(
        expect.objectContaining({
          tmdbGenreId: GENRE_A.tmdbGenreId,
          name: GENRE_A.name,
        })
      );
    });
  });
});
