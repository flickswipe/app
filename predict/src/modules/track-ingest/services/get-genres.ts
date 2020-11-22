import { iso6391 } from "@flickswipe/common";
import { Genre, GenreDoc } from "../models/genre";

export async function getGenres(language: iso6391): Promise<GenreDoc[] | null> {
  return await Genre.find({
    language: language as iso6391,
  });
}
