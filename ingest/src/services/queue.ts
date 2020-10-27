import { MovieId } from "../modules/tmdb-file-export/models/movie-id";
import { TmdbMovie } from "../modules/tmdb/models/tmdb-movie";

/**
 * Queue handler
 * Gets the next items that should be processed from the database
 */
export class Queue {
  /**
   * Detect if there has been a previous import
   *
   * @returns {boolean} true if no previous import
   */
  static async isFirstImport(): Promise<boolean> {
    const count = await MovieId.countDocuments({});
    return count === 0;
  }

  /**
   * Gets `tmdbMovieId` for the record that should be used to fetch utelly data
   * next, and moves it to end of queue.
   *
   * @returns {number} tmdbMovieId
   */
  static async getNextTmdbMovie(): Promise<number | void> {
    const movieIdDoc = await MovieId.findOne(
      // ignore documents marked as "neverUse"
      { neverUse: false }
    ).sort({
      // get doc that has been used the least
      timesUsed: 1,
    });

    if (!movieIdDoc?.tmdbMovieId) {
      return null;
    }

    // increment times used
    movieIdDoc.timesUsed++;
    await movieIdDoc.save();

    return movieIdDoc.tmdbMovieId;
  }

  /**
   * Gets `imdbId` for the record that should be used to fetch utelly data next,
   * and moves it to end of queue.
   *
   * @returns {string} imdbId
   */
  static async getNextUtelly(): Promise<string | void> {
    const tmdbMovieDoc = await TmdbMovie.findOne(
      // ignore documents marked as "neverUse"
      { neverUse: false }
    ).sort({
      // get doc that has been used the least
      timesUsed: 1,
    });

    if (!tmdbMovieDoc?.imdbId) {
      return null;
    }

    // increment times used
    tmdbMovieDoc.timesUsed++;
    await tmdbMovieDoc.save();

    return tmdbMovieDoc.imdbId;
  }
}
