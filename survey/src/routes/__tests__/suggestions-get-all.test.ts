import request from "supertest";
import { app } from "../../app";
import { SurveyResponse } from "../../modules/handle-survey-response/models/survey-response";
import { Genre } from "../../modules/track-ingest/models/genre";
import { MediaItem } from "../../modules/track-ingest/models/media-item";
import { Suggestion } from "../../modules/track-predict/models/suggestion";

// sample dasta
import { GENRE_A } from "../../test/sample-data/genres";
import { MEDIA_ITEM_A } from "../../test/sample-data/media-items";
import { SUGGESTION_A, SUGGESTION_B } from "../../test/sample-data/suggestions";
import { SURVEY_RESPONSE_INTERESTED_B } from "../../test/sample-data/survey-responses";
const USER = { id: SUGGESTION_A.user };

describe("get suggestions", () => {
  describe("invalid conditions", () => {
    describe("not signed in", () => {
      it("returns a 401", async () => {
        // has correct status
        await request(app).get("/api/en/survey/queue").send().expect(401);
      });
    });
  });

  describe("valid conditions", () => {
    describe("no suggestions exist", () => {
      it("returns a 200", async () => {
        // has correct status
        await request(app)
          .get("/api/en/survey/queue")
          .set("Cookie", await global.signIn(USER.id))
          .send()
          .expect(200);
      });

      it("returns empty array", async () => {
        const response = await request(app)
          .get("/api/en/survey/queue")
          .set("Cookie", await global.signIn(USER.id))
          .send();

        // has correct data
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
      });

      describe("suggestions exist", () => {
        beforeEach(async () => {
          await Promise.all([
            Genre.build(GENRE_A).save(),
            MediaItem.build(MEDIA_ITEM_A).save(),
            Suggestion.build(SUGGESTION_A).save(),
            Suggestion.build(SUGGESTION_B).save(),
            SurveyResponse.build(SURVEY_RESPONSE_INTERESTED_B),
          ]);
        });

        it("returns a 200", async () => {
          // has correct status
          await request(app)
            .get("/api/en/survey/queue")
            .set("Cookie", await global.signIn(USER.id))
            .send()
            .expect(200);
        });

        it("returns suggestions that don't have responses", async () => {
          const response = await request(app)
            .get("/api/en/survey/queue")
            .set("Cookie", await global.signIn(USER.id))
            .send();

          // has correct data
          expect(response.body).toBeInstanceOf(Array);
          expect(response.body).toHaveLength(1);
          expect(response.body[0]).toEqual(
            expect.objectContaining({
              id: MEDIA_ITEM_A.id,
              title: MEDIA_ITEM_A.title,
            })
          );
        });
      });
    });
  });
});
