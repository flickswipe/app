import { TmdbGenre, TmdbGenreDoc } from "../models/tmdb-genre";
import { tmdbGenresQuery } from "./queries/tmdb-genres-query";
import { tmdbGenresParser } from "./queries/tmdb-genres-parser";

import { GenreUpdatedPublisher } from "../../../events/publishers/genre-updated";
import { natsWrapper } from "../../../nats-wrapper";
import { unifyISO6391 } from "../../../services/unify-iso6391";

/**
 * Fetch genre data from the TMDB RESTful API
 *
 * @param language ISO 639-1 language to fetch results in
 *
 * @returns {TmdbGenreDoc[]} array of api results
 */
export async function fetchTmdbGenres(
  language: string,
  options: Record<string, unknown> = {}
): Promise<TmdbGenreDoc[]> {
  options;

  console.log(`Fetching tmdb genres in ${language}...`);

  // get new data
  const raw = await tmdbGenresQuery(language);
  if (!raw) {
    console.log(`No tmdb genres data for ${language}`);
    return null;
  }

  const result = await tmdbGenresParser(raw);

  // skip missing or irrelevant results
  if (!result?.genres) {
    return null;
  }

  const promises = result.genres.map(async (genre) => {
    // get existing data
    const existingDoc = await TmdbGenre.findOne({
      tmdbGenreId: genre.id,
      language,
    });

    // update existing doc
    if (existingDoc) {
      existingDoc.name = genre.name;

      await existingDoc.save();
      console.log(
        `Detected tmdb genre data for ${existingDoc.name} (${language})`
      );

      // publish event
      await new GenreUpdatedPublisher(natsWrapper.client).publish({
        tmdbGenreId: existingDoc.tmdbGenreId,
        name: existingDoc.name,
        language: unifyISO6391(existingDoc.language),
        updatedAt: new Date(),
      });

      return existingDoc;
    }

    // save new doc
    const insertedDoc = await TmdbGenre.build({
      tmdbGenreId: genre.id,
      name: genre.name,
      language: language,
    }).save();

    if (insertedDoc) {
      console.log(
        `Detected tmdb genre data for ${insertedDoc.name} (${language})`
      );

      // publish event
      await new GenreUpdatedPublisher(natsWrapper.client).publish({
        tmdbGenreId: insertedDoc.id,
        name: insertedDoc.name,
        language: unifyISO6391(insertedDoc.language),
        updatedAt: new Date(),
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
