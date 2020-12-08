import { Genre, GenreDoc } from '../models/genre';

export async function getGenres(): Promise<GenreDoc[] | null> {
  return await Genre.find();
}
