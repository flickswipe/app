import { GenreUpdatedPublisher } from '../../../events/publishers/genre-updated';
import { natsWrapper } from '../../../nats-wrapper';
import { TmdbGenre, TmdbGenreDoc } from '../models/tmdb-genre';
import { tmdbGenresParser } from './queries/tmdb-genres-parser';
import { tmdbGenresQuery } from './queries/tmdb-genres-query';

/**
 * Fetch genre data from the TMDB RESTful API
 *
 * @returns {TmdbGenreDoc[]} array of api results
 */
export async function fetchTmdbGenres(
  options: Record<string, unknown> = {}
): Promise<TmdbGenreDoc[]> {
  options;

  console.info(`Fetching tmdb genres...`);

  // get new data
  const raw = await tmdbGenresQuery();
  if (!raw) {
    console.info(`No tmdb genres data`);
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
      tmdbGenreId: genre.tmdbGenreId,
    });

    // update existing doc
    if (existingDoc) {
      existingDoc.name = genre.name;

      await existingDoc.save();
      console.info(`Detected tmdb genre data for ${existingDoc.name}`);

      // publish event
      await new GenreUpdatedPublisher(natsWrapper.client).publish({
        id: existingDoc.id,
        tmdbGenreId: existingDoc.tmdbGenreId,
        name: existingDoc.name,
        updatedAt: new Date(),
      });

      return existingDoc;
    }

    // save new doc
    const insertedDoc = await TmdbGenre.build({
      tmdbGenreId: genre.tmdbGenreId,
      name: genre.name,
    }).save();

    if (insertedDoc) {
      console.info(`Detected tmdb genre data for ${insertedDoc.name}`);

      // publish event
      await new GenreUpdatedPublisher(natsWrapper.client).publish({
        id: insertedDoc.id,
        tmdbGenreId: insertedDoc.tmdbGenreId,
        name: insertedDoc.name,
        updatedAt: insertedDoc.updatedAt,
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
