import request from "supertest";
import { app } from "../../app";
import { SurveyResponse } from "../../modules/handle-survey-response/models/survey-response";
import { Genre } from "../../modules/track-ingest/models/genre";
import { MediaItem } from "../../modules/track-ingest/models/media-item";

// sample data
import { GENRE_A } from "../../test/sample-data/genres";
import { MEDIA_ITEM_A, MEDIA_ITEM_B } from "../../test/sample-data/media-items";
import {
  SURVEY_RESPONSE_CONSUMED_B,
  SURVEY_RESPONSE_INTERESTED_A,
} from "../../test/sample-data/survey-responses";
const USER = {
  id: SURVEY_RESPONSE_INTERESTED_A.user,
};

describe("get survey responses", () => {
  describe("invalid conditions", () => {
    describe("not signed in", () => {
      it("returns a 401", async () => {
        // has correct status
        await request(app).get("/api/en/survey/ratings").send().expect(401);
      });
    });
  });

  describe("valid conditions", () => {
    describe("no survey responses exist", () => {
      it("returns a 200", async () => {
        // has correct status
        await request(app)
          .get("/api/en/survey/ratings")
          .set("Cookie", await global.signIn("aaabbbcccddd"))
          .send()
          .expect(200);
      });

      it("returns empty array", async () => {
        const response = await request(app)
          .get("/api/en/survey/ratings")
          .set("Cookie", await global.signIn("aaabbbcccddd"))
          .send();

        // has correct data
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
      });
    });

    describe("survey responses exist", () => {
      beforeEach(async () => {
        await Promise.all([
          Genre.build(GENRE_A).save(),
          MediaItem.build(MEDIA_ITEM_A).save(),
          MediaItem.build(MEDIA_ITEM_B).save(),
          SurveyResponse.build(SURVEY_RESPONSE_INTERESTED_A).save(),
          SurveyResponse.build(SURVEY_RESPONSE_CONSUMED_B).save(),
        ]);
      });

      it("returns a 200", async () => {
        // has correct status
        await request(app)
          .get("/api/en/survey/ratings")
          .set("Cookie", await global.signIn(USER.id))
          .send()
          .expect(200);
      });

      it("returns an array of ratings", async () => {
        const response = await request(app)
          .get("/api/en/survey/ratings")
          .set("Cookie", await global.signIn(USER.id))
          .send();

        // has correct data
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual({
          mediaItemId: MEDIA_ITEM_B.id,
          rating: 5,
        });
      });
    });
  });
});
