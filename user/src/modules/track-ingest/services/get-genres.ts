import { iso6391 } from "@flickswipe/common";
import { Genre, GenreDoc } from "../models/genre";

export async function getGenres(language: iso6391 = "en"): Promise<GenreDoc[]> {
  return await Genre.find({
    language,
  });
}
