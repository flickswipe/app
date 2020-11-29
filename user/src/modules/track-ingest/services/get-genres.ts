import { Genre, GenreDoc } from "../models/genre";

export async function getGenres(): Promise<GenreDoc[]> {
  return await Genre.find();
}
