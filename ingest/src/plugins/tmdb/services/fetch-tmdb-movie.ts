import { MovieId } from "../../tmdb-file-exports/models/movie-id";
import { TmdbMovie, TmdbMovieDoc } from "../models/tmdb-movie";
import { tmdbMovieQuery } from "./queries";
import { tmdbMovieResultParser } from "../result-parsers/movie";

import { MediaItemDestroyedPublisher } from "../../../events/publishers/media-item-destroyed";
import { natsWrapper } from "../../../nats-wrapper";

const EARLIEST_RELEASE_DATE = new Date("01-01-1970");

export async function fetchTmdbMovie(
  tmdbMovieId: number
): Promise<TmdbMovieDoc | void> {
  console.log(`Fetching tmdb movie ${tmdbMovieId}...`);

  // get new data
  const raw = await tmdbMovieQuery(tmdbMovieId);
  if (!raw) {
    console.log(`No tmdb movie data for ${tmdbMovieId}`);
    return null;
  }

  // parse new data
  const parsed = tmdbMovieResultParser(raw);
  if (!parsed) {
    return null;
  }

  // skip invalid movies (that might be valid in future)
  if (parsed.status !== "Released") return null;
  if (!parsed.imdbId) return null;

  // get existing data
  const existingDoc = await TmdbMovie.findOne({ tmdbMovieId });

  // never use movies that will never be valid
  let neverUse = false;
  if (parsed.adult) neverUse = true;
  if (parsed.releaseDate < EARLIEST_RELEASE_DATE) neverUse = true;

  if (neverUse) {
    const movieIdDoc = await MovieId.findOne({ tmdbMovieId });

    if (movieIdDoc) {
      // update db
      movieIdDoc.neverUse = true;
      await movieIdDoc.save();

      if (existingDoc) {
        existingDoc.neverUse = true;
        await existingDoc.save();
      }

      // publish event if previously emitted
      if (movieIdDoc.emitted === true) {
        await new MediaItemDestroyedPublisher(natsWrapper.client).publish({
          id: movieIdDoc.id,
        });
      }

      console.log(`Marked ${parsed.title} as not to be used.`);
    }

    return null;
  }

  // get new data
  const newDoc = {
    tmdbMovieId: tmdbMovieId,
    imdbId: parsed.imdbId,
    title: parsed.title,
    images: parsed.images,
    genres: parsed.genres,
    rating: parsed.rating,
    language: parsed.language,
    releaseDate: parsed.releaseDate,
    runtime: parsed.runtime,
    plot: parsed.plot,
  };

  // update existing doc
  if (existingDoc) {
    Object.assign(existingDoc, newDoc);

    await existingDoc
      .save()
      .then((existingDoc: TmdbMovieDoc) =>
        console.log(`Updated tmdb movie data for ${existingDoc.title}!`)
      )
      .catch((err: Error) => {
        throw err;
      });

    return existingDoc;
  }

  // create new doc
  const insertedDoc = await TmdbMovie.build(newDoc)
    .save()
    .then((insertedDoc: TmdbMovieDoc) => {
      console.log(`Created tmdb movie data for ${insertedDoc.title}`);
    })
    .catch((err: Error) => {
      throw err;
    });

  return insertedDoc;
}
