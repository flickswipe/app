import {
    SURVEY_RESPONSE_CONSUMED_A, SURVEY_RESPONSE_INTERESTED_A, SURVEY_RESPONSE_NEVER_A,
    SURVEY_RESPONSE_UNINTERESTED_A
} from '../../../../test/sample-data/survey-responses';
import { SurveyResponse } from '../../models/survey-response';
import { getSurveyResponses } from '../get-survey-responses';

describe("list all survey responses", () => {
  beforeEach(async () => {
    await Promise.all([
      SurveyResponse.build(SURVEY_RESPONSE_CONSUMED_A).save(),
      SurveyResponse.build(SURVEY_RESPONSE_INTERESTED_A).save(),
      SurveyResponse.build(SURVEY_RESPONSE_UNINTERESTED_A).save(),
      SurveyResponse.build(SURVEY_RESPONSE_NEVER_A).save(),
    ]);
  });

  it("should return all documents", async () => {
    // has correct data
    expect(
      await getSurveyResponses(SURVEY_RESPONSE_CONSUMED_A.user)
    ).toHaveLength(await SurveyResponse.countDocuments());
  });
});
