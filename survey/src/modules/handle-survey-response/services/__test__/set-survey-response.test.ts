import { BadRequestError } from '@flickswipe/common';

import { MEDIA_ITEM_A } from '../../../../test/sample-data/media-items';
import {
    SURVEY_RESPONSE_CONSUMED_A, SURVEY_RESPONSE_INTERESTED_A
} from '../../../../test/sample-data/survey-responses';
import { MediaItem } from '../../../track-ingest/models/media-item';
import { SurveyResponse } from '../../models/survey-response';
import { setSurveyResponse } from '../set-survey-response';

describe("set survey response", () => {
  describe("invalid conditions", () => {
    describe("no media item exists", () => {
      it("should throw error", async () => {
        // throws error
        await expect(() =>
          setSurveyResponse(
            SURVEY_RESPONSE_CONSUMED_A.user,
            SURVEY_RESPONSE_CONSUMED_A.mediaItem,
            SURVEY_RESPONSE_CONSUMED_A.interestType,
            SURVEY_RESPONSE_CONSUMED_A.rating
          )
        ).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe("valid conditions", () => {
    beforeEach(async () => {
      await MediaItem.build(MEDIA_ITEM_A).save();
    });

    describe("survey response exists", () => {
      beforeEach(async () => {
        await SurveyResponse.build(SURVEY_RESPONSE_INTERESTED_A).save();
      });

      it("should update existing survey response", async () => {
        await setSurveyResponse(
          SURVEY_RESPONSE_CONSUMED_A.user,
          SURVEY_RESPONSE_CONSUMED_A.mediaItem,
          SURVEY_RESPONSE_CONSUMED_A.interestType,
          SURVEY_RESPONSE_CONSUMED_A.rating
        );

        // has been updated
        expect(
          await SurveyResponse.findOne({
            user: SURVEY_RESPONSE_CONSUMED_A.user,
            mediaItem: SURVEY_RESPONSE_CONSUMED_A.mediaItem,
          })
        ).toEqual(expect.objectContaining(SURVEY_RESPONSE_CONSUMED_A));

        // no extra inserts
        expect(await SurveyResponse.countDocuments()).toBe(1);
      });
    });

    describe("no survey response exists", () => {
      it("should create survey response", async () => {
        await setSurveyResponse(
          SURVEY_RESPONSE_CONSUMED_A.user,
          SURVEY_RESPONSE_CONSUMED_A.mediaItem,
          SURVEY_RESPONSE_CONSUMED_A.interestType,
          SURVEY_RESPONSE_CONSUMED_A.rating
        );

        // has been created
        expect(
          await SurveyResponse.findOne({
            user: SURVEY_RESPONSE_CONSUMED_A.user,
            mediaItem: SURVEY_RESPONSE_CONSUMED_A.mediaItem,
          })
        ).toEqual(expect.objectContaining(SURVEY_RESPONSE_CONSUMED_A));

        // no extra inserts
        expect(await SurveyResponse.countDocuments()).toBe(1);
      });
    });
  });
});
