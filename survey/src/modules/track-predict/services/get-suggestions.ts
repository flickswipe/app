import { Suggestion } from '../models/suggestion';

export async function getSuggestions(user: string): Promise<string[]> {
  const suggestions = await Suggestion.find({
    user,
  });

  return Array.from(suggestions)
    .map(({ mediaItem }) => mediaItem)
    .filter((n) => n);
}
