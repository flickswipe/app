import mongoose from "mongoose";
import { MediaItemUpdatedPublisher } from "../events/publishers/media-item-updated";
import { natsWrapper } from "../nats-wrapper";
import { Utelly, UtellyDoc } from "../modules/rapidapi-utelly/models/utelly";
import { TmdbMovie } from "../modules/tmdb/models/tmdb-movie";
import { MovieId } from "../modules/tmdb-file-export/models/movie-id";
import { TmdbGenre } from "../modules/tmdb/models/tmdb-genre";

export async function announceMovie({
  imdbId,
  tmdbMovieId,
}: {
  imdbId?: string;
  tmdbMovieId?: number;
}): Promise<void> {
  // fail if not enough info
  if (!imdbId && !tmdbMovieId) {
    throw new Error("Must have at least one id");
  }

  // get tmdb data
  const tmdbMovieDoc =
    (imdbId && (await TmdbMovie.findOne({ imdbId }))) ||
    (tmdbMovieId && (await TmdbMovie.findOne({ tmdbMovieId })));

  if (!tmdbMovieDoc) {
    throw new Error("Couldn't fetch movie data");
  }

  // get utelly data
  const utellyDocs = await Utelly.find({
    imdbId: tmdbMovieDoc.imdbId,
  });

  if (!utellyDocs.length) {
    throw new Error("Couldn't fetch utelly data");
  }

  // get genres data
  const tmdbGenres = await TmdbGenre.find();
  const docIdByTmdbGenreId = new Map();
  tmdbGenres.forEach(({ id, tmdbGenreId }) => {
    docIdByTmdbGenreId.set(tmdbGenreId, id);
  });
  const genreDocIds = tmdbMovieDoc.genres
    .map((tmdbGenreId) => docIdByTmdbGenreId.get(tmdbGenreId))
    .filter((n) => n);

  if (!tmdbGenres.length || genreDocIds.length < tmdbMovieDoc.genres.length) {
    throw new Error("Couldn't fetch complete genre data");
  }

  // merge data
  const streamLocations: {
    [key: string]: {
      id: string;
      name: string;
      url: string;
    }[];
  } = {};
  const updatedAts: Date[] = [tmdbMovieDoc.updatedAt];

  utellyDocs.forEach((utellyDoc: UtellyDoc) => {
    const { country, locations, updatedAt } = utellyDoc;

    const result = locations.map(
      (location: { id: string; displayName: string; url: string }) => ({
        id: mongoose.Types.ObjectId(
          location.id.padStart(24, "0").slice(-24)
        ).toHexString(),
        name: location.displayName,
        url: location.url,
      })
    );

    if (!result.length) {
      return;
    }

    streamLocations[country] = result;
    updatedAts.push(updatedAt);
  });

  if (!Object.values(streamLocations).length) {
    console.log(
      `${tmdbMovieDoc.title} isn't availabe to stream in any country`
    );
    return;
  }

  const mostRecentUpdatedAt = new Date(
    Math.max.apply(
      null,
      updatedAts.map((date) => date.getTime())
    )
  );

  const mediaItem = {
    id: tmdbMovieDoc.id,
    tmdbMovieId: tmdbMovieDoc.tmdbMovieId,
    imdbId: tmdbMovieDoc.imdbId,
    title: tmdbMovieDoc.title,
    genres: genreDocIds,
    images: tmdbMovieDoc.images,
    rating: tmdbMovieDoc.rating,
    audioLanguage: tmdbMovieDoc.audioLanguage,
    releaseDate: tmdbMovieDoc.releaseDate,
    runtime: tmdbMovieDoc.runtime,
    plot: tmdbMovieDoc.plot || "",
    streamLocations: streamLocations,
    updatedAt: mostRecentUpdatedAt,
  };

  // publish event
  console.log(`Broadcasting media item...`, mediaItem);
  await new MediaItemUpdatedPublisher(natsWrapper.client).publish(mediaItem);

  // mark movie as published
  await MovieId.findOneAndUpdate(
    { tmdbMovieId: tmdbMovieDoc.tmdbMovieId },
    { emitted: true }
  );
}
