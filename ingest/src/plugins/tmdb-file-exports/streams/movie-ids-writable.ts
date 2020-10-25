import { Writable } from "stream";

import { movieIdsLineParser } from "../line-parsers/movie-ids";
import { MovieId } from "../models/movie-id";

export const movieIdsWritableStream = new Writable({
  write: function (
    chunk: string,
    encoding: string,
    next: (err?: Error | null, chunk?: string) => void
  ) {
    const data = movieIdsLineParser(chunk);

    // don't add incomplete records
    if (!data || !data.tmdbMovieId) {
      return next();
    }

    MovieId.findOne({ tmdbMovieId: data.tmdbMovieId }).then((existingDoc) => {
      // don't overwrite records
      if (existingDoc) {
        return next();
      }

      // create new record
      MovieId.build({
        tmdbMovieId: data.tmdbMovieId,
      })
        .save()
        .then(() => next())
        // .then((doc) => {
        //   console.log(`Got tmdbMovieId #${doc.tmdbMovieId}`);
        //   next();
        // })
        .catch((err) => {
          throw err;
        });
    });
  },
});
