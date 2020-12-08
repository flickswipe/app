import { addBreadcrumb, configureScope, startTransaction } from '@sentry/node';

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

  const tx = startTransaction({
    op: "fetch-tmdb-genres",
    name: "Fetch TMDB Genres Data",
    data: {
      options,
    },
  });

  configureScope((scope) => scope.setSpan(tx));

  addBreadcrumb({
    category: "tmdb-genres",
    message: `Fetch`,
  });

  // get new data
  const raw = await tmdbGenresQuery();
  if (!raw) {
    addBreadcrumb({
      category: "tmdb-genres",
      message: `No data`,
    });
    tx.finish();
    return null;
  }

  const result = await tmdbGenresParser(raw);

  // skip missing or irrelevant results
  if (!result?.genres) {
    addBreadcrumb({
      category: "tmdb-genres",
      message: `Malformed data`,
    });
    tx.finish();
    return null;
  }

  const promises = result.genres.map(async (genre) => {
    // get existing data
    const existingDoc = await TmdbGenre.findOne({
      tmdbGenreId: genre.tmdbGenreId,
    });

    // update existing doc
    if (existingDoc) {
      addBreadcrumb({
        category: "tmdb-genres",
        message: `Update genre ${existingDoc.id}`,
      });

      const previousName = existingDoc.name;
      existingDoc.name = genre.name;

      await existingDoc.save();

      // publish event
      await new GenreUpdatedPublisher(natsWrapper.client).publish({
        id: existingDoc.id,
        tmdbGenreId: existingDoc.tmdbGenreId,
        name: existingDoc.name,
        updatedAt: new Date(),
      });

      console.info(`Renamed tmdb genre ${previousName} to ${existingDoc.name}`);
      return existingDoc;
    }

    // save new doc
    addBreadcrumb({
      category: "tmdb-genres",
      message: `Create genre ${genre.tmdbGenreId} ${genre.name}`,
    });

    const insertedDoc = await TmdbGenre.build({
      tmdbGenreId: genre.tmdbGenreId,
      name: genre.name,
    }).save();

    if (insertedDoc) {
      // publish event
      await new GenreUpdatedPublisher(natsWrapper.client).publish({
        id: insertedDoc.id,
        tmdbGenreId: insertedDoc.tmdbGenreId,
        name: insertedDoc.name,
        updatedAt: insertedDoc.updatedAt,
      });
    }

    console.info(`Created tmdb genre ${insertedDoc.name}`);
    return insertedDoc;
  });

  // wait for all promises to resolve
  let docs = await Promise.all(promises);

  // filter out promises that didn't resolve with a doc
  docs = docs.filter(
    (doc: TmdbGenreDoc | void): boolean => doc instanceof TmdbGenre
  ) as TmdbGenreDoc[];

  tx.finish();
  return docs;
}
