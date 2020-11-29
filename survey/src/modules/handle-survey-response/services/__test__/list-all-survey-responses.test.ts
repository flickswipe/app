import {
  SURVEY_RESPONSE_CONSUMED_A,
  SURVEY_RESPONSE_INTERESTED_A,
  SURVEY_RESPONSE_NEVER_A,
  SURVEY_RESPONSE_UNINTERESTED_A,
} from "../../../../test/sample-data/survey-responses";
import { SurveyResponse } from "../../models/survey-response";
import { listAllSurveyResponses } from "../list-all-survey-responses";

describe("list all survey responses", () => {
  beforeEach(async () => {
    await SurveyResponse.build(SURVEY_RESPONSE_CONSUMED_A).save();
    await SurveyResponse.build(SURVEY_RESPONSE_INTERESTED_A).save();
    await SurveyResponse.build(SURVEY_RESPONSE_UNINTERESTED_A).save();
    await SurveyResponse.build(SURVEY_RESPONSE_NEVER_A).save();
  });

  it("should return all documents", async () => {
    // returns correct data
    expect(
      await listAllSurveyResponses(SURVEY_RESPONSE_CONSUMED_A.user)
    ).toHaveLength(await SurveyResponse.countDocuments());
  });
});
