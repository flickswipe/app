import { Transform } from "stream";

import { movieIdsLineParser } from "../line-parsers/movie-ids";

const MIN_POPULARITY = 20;

export class MovieIdsRowsFilter extends Transform {
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });
  }

  _transform(
    chunk: string,
    encoding: string,
    next: (err?: Error | null, chunk?: string) => void
  ): void {
    const data = movieIdsLineParser(chunk);

    if (
      !data ||
      !data.tmdbMovieId ||
      data.adult ||
      data.popularity < MIN_POPULARITY
    ) {
      return next();
    }

    return next(null, chunk);
  }
}
