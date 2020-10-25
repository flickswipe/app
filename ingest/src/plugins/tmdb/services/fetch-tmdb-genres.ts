import { TmdbGenre, TmdbGenreDoc } from "../models/tmdb-genre";
import { tmdbGenresQuery } from "./queries";
import { tmdbGenresResultParser } from "../result-parsers/genres";

import { GenreDetectedPublisher } from "../../../events/publishers/genre-detected";
import { natsWrapper } from "../../../nats-wrapper";

export async function fetchTmdbGenres(
  language = "en"
): Promise<TmdbGenreDoc[]> {
  console.log(`Fetching tmdb genres in ${language}...`);

  // get new data
  const raw = await tmdbGenresQuery(language);
  if (!raw) {
    console.log(`No tmdb genres data for ${language}`);
    return null;
  }

  // parse new data
  const parsed = tmdbGenresResultParser(raw);
  if (!parsed?.genres) return null;

  const promises = parsed.genres.map(async (genre) => {
    // get existing data
    const existingDoc = await TmdbGenre.findOne({ tmdbGenreId: genre.id });

    // get new data
    const newDoc = {
      tmdbGenreId: genre.id,
      name: genre.name,
      language,
    };

    // update existing doc
    if (existingDoc) {
      // ignore if no update needed
      if (existingDoc.name === newDoc.name) {
        return existingDoc;
      }

      // otherwise, update
      Object.assign(existingDoc, newDoc);

      await existingDoc.save().catch((err: Error) => {
        throw err;
      });

      console.log(`Detected tmdb genre data for ${existingDoc.name}`);

      // publish event
      // await new GenreDetectedPublisher(natsWrapper.client).publish({
      //   id: existingDoc.id,
      //   name: existingDoc.name,
      //   language: existingDoc.language,
      //   detectedAt: new Date(),
      // });

      return existingDoc;
    }

    // save new doc
    const insertedDoc = await TmdbGenre.build(newDoc)
      .save()
      .catch((err: Error) => {
        throw err;
      });

    if (insertedDoc) {
      console.log(`Detected tmdb genre data for ${insertedDoc.name}`);

      // publish event
      // await new GenreDetectedPublisher(natsWrapper.client).publish({
      //   id: insertedDoc.id,
      //   name: insertedDoc.name,
      //   language: insertedDoc.language,
      //   detectedAt: new Date(),
      // });
    }

    return insertedDoc;
  });

  const docs = await Promise.all(promises);

  return docs.filter(
    (doc: TmdbGenreDoc | void): boolean => doc instanceof TmdbGenre
  ) as TmdbGenreDoc[];
}
