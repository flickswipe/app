import request from 'supertest';

import { InterestType } from '@flickswipe/common';

import { app } from '../../app';
import { Genre } from '../../modules/track-ingest/models/genre';
import { MediaItem } from '../../modules/track-ingest/models/media-item';
// sample data
import { GENRE_A } from '../../test/sample-data/genres';
import { MEDIA_ITEM_A, MEDIA_ITEM_B } from '../../test/sample-data/media-items';

describe("survey respond", () => {
  describe("invalid conditions", () => {
    describe("not signed in", () => {
      it("returns a 401", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .send({
            interestType: InterestType.Interested,
          })
          .expect(401);
      });
    });

    describe("no media item exists", () => {
      it("returns a 404", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_B.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Interested,
          })
          .expect(404);
      });
    });

    describe("invalid id", () => {
      it("returns a 400 when invalid id", async () => {
        // has correct status
        await request(app)
          .post("/api/en/survey/invalid-id/respond")
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Interested,
          })
          .expect(400);
      });
    });

    describe("no interest type", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({})
          .expect(400);
      });
    });

    describe("invalid interest type", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: "invalid",
          })
          .expect(400);
      });
    });

    describe("rating greater than 100", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Consumed,
            rating: 500,
          })
          .expect(400);
      });
    });

    describe("rating less than 0", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Consumed,
            rating: -1,
          })
          .expect(400);
      });
    });

    describe("rating not a number", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Consumed,
            rating: "10",
          })
          .expect(400);
      });
    });

    describe("rating given for unconsumed media", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Interested,
            rating: 5,
          })
          .expect(400);
      });
    });
  });

  describe("valid conditions", () => {
    beforeEach(async () => {
      await Promise.all([
        await Genre.build(GENRE_A).save(),
        await MediaItem.build(MEDIA_ITEM_A).save(),
      ]);
    });

    describe("rating supplied", () => {
      it("returns a 200 with rating", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Consumed,
            rating: 5,
          })
          .expect(200);
      });
    });

    describe("no rating supplied", () => {
      it("returns a 200 with no rating", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/survey/${MEDIA_ITEM_A.id}/respond`)
          .set("Cookie", await global.signIn())
          .send({
            interestType: InterestType.Consumed,
          })
          .expect(200);
      });
    });
  });
});
