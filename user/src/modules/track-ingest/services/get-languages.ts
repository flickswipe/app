import { Language, LanguageDoc } from "../models/language";

export async function getLanguages(): Promise<LanguageDoc[]> {
  return await Language.find();
}
