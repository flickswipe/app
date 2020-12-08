import { addBreadcrumb, configureScope, startTransaction } from '@sentry/node';

import { MediaItemDestroyedPublisher } from '../../../events/publishers/media-item-destroyed';
import { natsWrapper } from '../../../nats-wrapper';
import { MovieId } from '../../tmdb-file-export/models/movie-id';
import { TmdbMovie, TmdbMovieDoc } from '../models/tmdb-movie';
import { TmdbMovieApiResult, tmdbMovieParser } from './queries/tmdb-movie-parser';
import { tmdbMovieQuery } from './queries/tmdb-movie-query';

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
  const tx = startTransaction({
    op: "fetch-tmdb-movie",
    name: "Fetch TMDB Movie Data",
    data: {
      tmdbMovieId,
      options,
    },
  });

  configureScope((scope) => scope.setSpan(tx));

  addBreadcrumb({
    category: "tmdb-movie",
    message: `Fetch ${tmdbMovieId}`,
  });

  // get new data
  const raw = await tmdbMovieQuery(tmdbMovieId);
  if (!raw) {
    addBreadcrumb({
      category: "tmdb-movie",
      message: `No data for ${tmdbMovieId}`,
    });
    tx.finish();
    return null;
  }

  const result = await tmdbMovieParser(raw);

  // skip missing or irrelevant results
  if (!result || shouldSkip(result, options)) {
    addBreadcrumb({
      category: "tmdb-movie",
      message: `Skipping ${tmdbMovieId}`,
    });
    tx.finish();
    return null;
  }

  // get existing data
  const existingDoc = await TmdbMovie.findOne({ tmdbMovieId });

  // mark as never used
  if (shouldNeverUse(result, options)) {
    addBreadcrumb({
      category: "tmdb-movie",
      message: `Never use ${tmdbMovieId}`,
    });

    // update movie id doc
    const movieIdDoc = await MovieId.findOne({ tmdbMovieId });
    if (movieIdDoc) {
      movieIdDoc.neverUse = true;
      await movieIdDoc.save();

      // if previously emitted, make sure other services know to delete media
      if (movieIdDoc.emitted === true) {
        await new MediaItemDestroyedPublisher(natsWrapper.client).publish({
          id: movieIdDoc.id,
          updatedAt: movieIdDoc.updatedAt,
        });
      }
    }

    // update tmdb movie doc
    if (existingDoc) {
      existingDoc.neverUse = true;
      await existingDoc.save();
    }

    // end processing
    tx.finish();
    return null;
  }

  // update existing doc
  if (existingDoc) {
    addBreadcrumb({
      category: "tmdb-movie",
      message: `Updating ${tmdbMovieId}`,
    });

    existingDoc.imdbId = result.imdbId;
    existingDoc.title = result.title;
    existingDoc.images = result.images;
    existingDoc.genres = result.genres;
    existingDoc.rating = result.rating;
    existingDoc.audioLanguage = result.audioLanguage;
    existingDoc.releaseDate = result.releaseDate;
    existingDoc.runtime = result.runtime;
    existingDoc.plot = result.plot;
    await existingDoc.save();

    console.info(`Updated tmdb movie data for ${existingDoc.title}`);
    tx.finish();
    return existingDoc;
  }

  // create new doc
  addBreadcrumb({
    category: "tmdb-movie",
    message: `Creating ${tmdbMovieId}`,
  });

  const insertedDoc = await TmdbMovie.build({
    tmdbMovieId: tmdbMovieId,
    imdbId: result.imdbId,
    title: result.title,
    images: result.images,
    genres: result.genres,
    rating: result.rating,
    audioLanguage: result.audioLanguage,
    releaseDate: result.releaseDate,
    runtime: result.runtime,
    plot: result.plot,
  }).save();

  console.info(`Created tmdb movie data for ${insertedDoc.title}`);
  tx.finish();
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

  // filter condition: must have required fields
  const stringValues = [
    result.tmdbMovieId,
    result.imdbId,
    result.title,
    result.images.poster,
    result.images.backdrop,
    result.audioLanguage,
    result.releaseDate,
    result.runtime,
  ].map((item) => `${item}`);

  if (stringValues.includes("null") || stringValues.includes("NaN")) {
    return true;
  }

  // filter condition: media must have been released already
  if (result.status !== "Released") {
    return true;
  }

  // filter condition: media must have an IMDb record
  if (!result.imdbId) {
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

  return false;
}
