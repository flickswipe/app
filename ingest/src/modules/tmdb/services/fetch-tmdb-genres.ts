import { TmdbGenre, TmdbGenreDoc } from "../models/tmdb-genre";
import { tmdbGenresQuery } from "./queries/tmdb-genres-query";
import { tmdbGenresParser } from "./queries/tmdb-genres-parser";

import { GenreDetectedPublisher } from "../../../events/publishers/genre-detected";
import { natsWrapper } from "../../../nats-wrapper";

/**
 * Fetch genre data from the TMDB RESTful API
 *
 * @param language ISO 639-1 language to fetch results in
 *
 * @returns {TmdbGenreDoc[]} array of api results
 */
export async function fetchTmdbGenres(
  language = "en-US"
): Promise<TmdbGenreDoc[]> {
  console.log(`Fetching tmdb genres in ${language}...`);

  // get new data
  const raw = await tmdbGenresQuery(language);
  if (!raw) {
    console.log(`No tmdb genres data for ${language}`);
    return null;
  }

  const result = tmdbGenresParser(raw);

  // skip missing or irrelevant results
  if (!result?.genres) {
    return null;
  }

  const promises = result.genres.map(async (genre) => {
    // get existing data
    const existingDoc = await TmdbGenre.findOne({ tmdbGenreId: genre.id });

    // update existing doc
    if (existingDoc) {
      existingDoc.name = genre.name;

      await existingDoc.save();
      console.log(`Detected tmdb genre data for ${existingDoc.name}`);

      // publish event
      await new GenreDetectedPublisher(natsWrapper.client).publish({
        id: existingDoc.id,
        name: existingDoc.name,
        language: existingDoc.language,
        detectedAt: new Date(),
      });

      return existingDoc;
    }

    // save new doc
    const insertedDoc = await TmdbGenre.build({
      tmdbGenreId: genre.id,
      name: genre.name,
      language,
    }).save();

    if (insertedDoc) {
      console.log(`Detected tmdb genre data for ${insertedDoc.name}`);

      // publish event
      await new GenreDetectedPublisher(natsWrapper.client).publish({
        id: insertedDoc.id,
        name: insertedDoc.name,
        language: insertedDoc.language,
        detectedAt: new Date(),
      });
    }

    return insertedDoc;
  });

  // wait for all promises to resolve
  let docs = await Promise.all(promises);

  // filter out promises that didn't resolve with a doc
  docs = docs.filter(
    (doc: TmdbGenreDoc | void): boolean => doc instanceof TmdbGenre
  ) as TmdbGenreDoc[];

  return docs;
}
