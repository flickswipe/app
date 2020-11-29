import { Language, LanguageDoc } from "../models/language";

export async function getAudioLanguages(): Promise<LanguageDoc[]> {
  return await Language.find();
}
