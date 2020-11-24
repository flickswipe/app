import { SurveyResponse, SurveyResponseDoc } from "../models/survey-response";

export async function listAllSurveyResponses(
  user: string
): Promise<SurveyResponseDoc[]> {
  return await SurveyResponse.find({ user });
}
