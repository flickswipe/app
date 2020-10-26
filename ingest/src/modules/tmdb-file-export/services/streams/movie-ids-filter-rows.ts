import { Transform } from "stream";

import { movieIdsParser } from "./movie-ids-parser";

/**
 * Filter config
 */
const INCLUDE_ADULT_CONTENT = false;
const MIN_POPULARITY = 20;

/**
 * Transform stream to filter chunks
 */
export class MovieIdsFilterRows extends Transform {
  /**
   * Set read/write mode
   */
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });
  }

  /**
   * Filter out chunks that don't meet the rules
   *
   * @param chunk chunk to process
   * @param encoding encoding of chunk
   * @param next call to continue stream processing
   */
  _transform(
    chunk: string,
    encoding: string,
    next: (err?: Error | null, chunk?: string) => void
  ): void {
    // get data from chunk
    const data = movieIdsParser(chunk);

    // filter condition: data must be complete
    if (!data || !data.tmdbMovieId) {
      next();
      return;
    }

    // filter condition: reject adult content if not included
    if (!INCLUDE_ADULT_CONTENT && data.adult) {
      next();
      return;
    }

    // filter condition: ignore unpopular content
    if (data.popularity < MIN_POPULARITY) {
      next();
      return;
    }

    // no filter conditions met: pass on chunk for processing
    return next(null, chunk);
  }
}
