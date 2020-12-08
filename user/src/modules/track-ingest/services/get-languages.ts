import { AudioLanguage, AudioLanguageDoc } from '../models/audio-language';

export async function getAudioLanguages(): Promise<AudioLanguageDoc[]> {
  return await AudioLanguage.find();
}
