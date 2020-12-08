import { Writable } from 'stream';

import { MovieId } from '../../models/movie-id';
import { movieIdsParser } from './movie-ids-parser';

/**
 * Stream MovieId data to MovieId mongodb collection
 */
export const movieIdsWriteMongodb = (): Writable =>
  new Writable({
    /**
     * @param chunk current chunk to process
     * @param encoding encoding of chunk
     * @param next call to continue stream processing
     */
    write: async function (
      chunk: string,
      encoding: string,
      next: (err?: Error | null, chunk?: string) => void
    ) {
      // parse data
      const data = movieIdsParser(chunk);

      // don't add incomplete data
      if (!data || !data.tmdbMovieId) {
        next();
        return;
      }

      // don't overwrite existing docs
      const existingDoc = await MovieId.findOne({
        tmdbMovieId: data.tmdbMovieId,
      });

      if (existingDoc) {
        next();
        return;
      }

      // create new document
      await MovieId.build({
        tmdbMovieId: data.tmdbMovieId,
      }).save();

      // continue streaming
      next();
    },
  });
