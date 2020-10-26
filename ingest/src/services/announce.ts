import { MediaItemUpdatedPublisher } from "../events/publishers/media-item-updated";
import { natsWrapper } from "../nats-wrapper";
import { Utelly, UtellyDoc } from "../modules/rapidapi-utelly/models/utelly";
import { TmdbMovie } from "../modules/tmdb/models/tmdb-movie";
import { MovieId } from "../modules/tmdb-file-export/models/movie-id";

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

  // merge data
  const streamLocations: {
    [key: string]: {
      name: string;
      url: string;
    }[];
  } = {};
  const updatedAts: Date[] = [tmdbMovieDoc.updatedAt];

  utellyDocs.forEach((utellyDoc: UtellyDoc) => {
    const { country, locations, updatedAt } = utellyDoc;

    const result = locations.map(
      (location: { displayName: string; url: string }) => ({
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
    title: tmdbMovieDoc.title,
    images: tmdbMovieDoc.images,
    rating: tmdbMovieDoc.rating,
    language: tmdbMovieDoc.language,
    releaseDate: tmdbMovieDoc.releaseDate,
    runtime: tmdbMovieDoc.runtime,
    plot: tmdbMovieDoc.plot || "",
    streamLocations: streamLocations,
    updatedAt: mostRecentUpdatedAt,
  };

  // publish event
  console.log(`Broadcasting media item...`);
  await new MediaItemUpdatedPublisher(natsWrapper.client).publish(mediaItem);

  // mark movie as published
  await MovieId.findOneAndUpdate(
    { tmdbMovieId: tmdbMovieDoc.tmdbMovieId },
    { emitted: true }
  );
}
