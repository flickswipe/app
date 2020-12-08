import { SurveyResponse, SurveyResponseDoc } from '../models/survey-response';

export async function getSurveyResponses(
  user: string
): Promise<SurveyResponseDoc[]> {
  return await SurveyResponse.find({ user });
}
