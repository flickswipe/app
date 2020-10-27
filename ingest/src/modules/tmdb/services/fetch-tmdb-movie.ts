import { MovieId } from "../../tmdb-file-export/models/movie-id";
import { TmdbMovie, TmdbMovieDoc } from "../models/tmdb-movie";
import { tmdbMovieQuery } from "./queries/tmdb-movie-query";
import {
  tmdbMovieParser,
  TmdbMovieApiResult,
} from "./queries/tmdb-movie-parser";

import { MediaItemDestroyedPublisher } from "../../../events/publishers/media-item-destroyed";
import { natsWrapper } from "../../../nats-wrapper";

/**
 * Fetch movie data from the TMDB RESTful API
 *
 * @param tmdbMovieId movie id to fetch
 *
 * @returns {TmdbMovieDoc} api result
 */
export async function fetchTmdbMovie(
  tmdbMovieId: number,
  options: {
    includeAdultContent?: boolean;
    earliestReleaseDate?: Date;
  } = {}
): Promise<TmdbMovieDoc | void> {
  console.log(`Fetching tmdb movie ${tmdbMovieId}...`);

  // get new data
  const raw = await tmdbMovieQuery(tmdbMovieId);
  if (!raw) {
    console.log(`No tmdb movie data for ${tmdbMovieId}`);
    return null;
  }

  const result = tmdbMovieParser(raw);

  // skip missing or irrelevant results
  if (!result || shouldSkip(result, options)) {
    return null;
  }

  // get existing data
  const existingDoc = await TmdbMovie.findOne({ tmdbMovieId });

  // mark as never used
  if (shouldNeverUse(result, options)) {
    // update movie id doc
    const movieIdDoc = await MovieId.findOne({ tmdbMovieId });
    if (movieIdDoc) {
      movieIdDoc.neverUse = true;
      await movieIdDoc.save();

      // if previously emitted, make sure other services know to delete media
      if (movieIdDoc.emitted === true) {
        await new MediaItemDestroyedPublisher(natsWrapper.client).publish({
          id: movieIdDoc.id,
        });
      }
    }

    // update tmdb movie doc
    if (existingDoc) {
      existingDoc.neverUse = true;
      await existingDoc.save();
    }

    // end processing
    console.log(`Marked ${result.title} as never to be used.`);
    return null;
  }

  // update existing doc
  if (existingDoc) {
    existingDoc.imdbId = result.imdbId;
    existingDoc.title = result.title;
    existingDoc.images = result.images;
    existingDoc.genres = result.genres;
    existingDoc.rating = result.rating;
    existingDoc.language = result.language;
    existingDoc.releaseDate = result.releaseDate;
    existingDoc.runtime = result.runtime;
    existingDoc.plot = result.plot;

    await existingDoc.save();
    console.log(`Updated tmdb movie data for ${existingDoc.title}!`);

    return existingDoc;
  }

  // create new doc
  const insertedDoc = await TmdbMovie.build({
    tmdbMovieId: tmdbMovieId,
    imdbId: result.imdbId,
    title: result.title,
    images: result.images,
    genres: result.genres,
    rating: result.rating,
    language: result.language,
    releaseDate: result.releaseDate,
    runtime: result.runtime,
    plot: result.plot,
  }).save();
  console.log(`Created tmdb movie data for ${insertedDoc.title}`);

  return insertedDoc;
}

/**
 * Filter out results that aren't relevant now
 *
 * @param result result to filter
 *
 * @returns {Boolean} true if result should be skipped
 */
function shouldSkip(
  result: TmdbMovieApiResult,
  options: Record<string, unknown> = {}
): boolean {
  options;

  // filter condition: media must have been released already
  if (result.status !== "Released") {
    return true;
  }

  // filter condition: media must have an IMDb record
  if (!result.imdbId) {
    return true;
  }

  return false;
}

/**
 * Filter out results that will never be relevant
 *
 * @param result result to filter
 *
 * @returns {Boolean} true if result should be skipped
 */
function shouldNeverUse(
  result: TmdbMovieApiResult,
  options: Record<string, unknown> = {}
): boolean {
  // filter condition: no adult content
  if (!options.includeAdultContent && result.adult) {
    return true;
  }

  // filter condition: must be recent
  if (
    options.earliestReleaseDate instanceof Date &&
    result.releaseDate < options.earliestReleaseDate
  ) {
    return true;
  }

  return false;
}
